import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email";
import { isStripeConfigured } from "@/lib/env";
import { createServiceSupabase } from "@/lib/supabase/server";
import { publicOrderId } from "@/lib/checkout";
import type { Order } from "@/lib/types";
import type Stripe from "stripe";

// Stripe calls this with no user session. I refuse to run without the
// webhook secret (503, and nothing is invented), and I verify the
// signature against the raw body before reading the event. A bad
// signature is 400. Stripe will not keep delivering a tampered payload.
export async function POST(request: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const StripeSdk = (await import("stripe")).default;
  const stripe = new StripeSdk(process.env.STRIPE_SECRET_KEY!);
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const stored = await recordOrder(session);
    if (!stored) {
      // 503 so Stripe retries. That covers a missing service role key,
      // and a unique-constraint race where the other delivery committed
      // the order first. A 200 here would drop a paid checkout.
      return NextResponse.json({ error: "Order storage is not configured." }, { status: 503 });
    }
  }

  return NextResponse.json({ received: true });
}

async function recordOrder(session: Stripe.Checkout.Session): Promise<boolean> {
  // Service role, because a customer has no insert grant on oak.orders.
  // Returning true means "ack the event". Returning false means "retry".
  const supabase = createServiceSupabase();
  if (!supabase) return false;

  const { data: existing } = await supabase
    .from("oak_orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  // Already recorded. Ack so Stripe stops, and skip the stock update
  // so a retry can't decrement twice.
  if (existing) return true;

  const metadata = session.metadata ?? {};
  const email = session.customer_email || metadata.email || "";
  const items = (metadata.items ?? "")
    .split(",")
    .map((part) => {
      const [variantId, quantity] = part.split(":");
      return { variantId, quantity: Number(quantity) };
    })
    .filter((item) => item.variantId && item.quantity > 0);

  // Nothing we can fulfill. Ack rather than retry forever on a session
  // that arrived without an email or a line.
  if (!email || items.length === 0) return true;

  // Price and name come from the variant row, not from metadata. The
  // metadata list is only "which variant, how many".
  const { data: variants } = await supabase
    .from("oak_product_variants")
    .select("id, price_cents, finish, material, color, stock, product:oak_products(name)")
    .in("id", items.map((item) => item.variantId));

  const lines = items.flatMap((item) => {
    const variant = (variants ?? []).find((row) => row.id === item.variantId);
    if (!variant) return [];
    const product = Array.isArray(variant.product) ? variant.product[0] : variant.product;
    return [{
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice: variant.price_cents as number,
      label: `${variant.finish} · ${variant.material} · ${variant.color}`,
      name: (product as { name?: string } | null)?.name ?? "Piece",
      stock: variant.stock as number,
    }];
  });

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const shipping = session.shipping_cost?.amount_total ?? 0;
  const total = session.amount_total ?? subtotal + shipping;
  const publicId = publicOrderId();

  const { data: order, error } = await supabase
    .from("oak_orders")
    .insert({
      public_id: publicId,
      user_id: metadata.userId || null,
      email,
      status: "paid",
      stripe_session_id: session.id,
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: total,
      shipping_name: metadata.name || null,
      shipping_address: metadata.address || null,
    })
    .select("id")
    .single();

  // A unique violation on stripe_session_id lands here too. The other
  // request owns the order; we return false, Stripe retries, and the
  // lookup above acks it without touching stock.
  if (error || !order) return false;

  await supabase.from("oak_order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      variant_id: line.variantId,
      product_name: line.name,
      variant_label: line.label,
      unit_price_cents: line.unitPrice,
      quantity: line.quantity,
    })),
  );

  // Read-then-write. Checkout already rejected a line that was over
  // stock, and this loop is the only writer that decrements. Two paid
  // sessions for the last unit can still both pass; I accept that for
  // this catalog rather than holding a reservation across Stripe.
  for (const line of lines) {
    await supabase
      .from("oak_product_variants")
      .update({ stock: Math.max(0, line.stock - line.quantity) })
      .eq("id", line.variantId);
  }

  const confirmation: Order = {
    id: publicId,
    email,
    name: metadata.name || "Customer",
    address: metadata.address || "",
    status: "paid",
    subtotalCents: subtotal,
    shippingCents: shipping,
    totalCents: total,
    createdAt: new Date().toISOString(),
    items: lines.map((line) => ({
      id: line.variantId,
      variantId: line.variantId,
      productName: line.name,
      variantLabel: line.label,
      unitPriceCents: line.unitPrice,
      quantity: line.quantity,
    })),
  };

  try {
    await sendOrderEmail(confirmation);
  } catch {
    // The order row is already committed. Failing the webhook here would
    // make Stripe retry a paid event, and the retry would ack without
    // sending the mail anyway.
  }
  return true;
}

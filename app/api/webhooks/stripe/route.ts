import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email";
import { isStripeConfigured } from "@/lib/env";
import { createServiceSupabase } from "@/lib/supabase/server";
import { publicOrderId } from "@/lib/checkout";
import type { Order } from "@/lib/types";
import type Stripe from "stripe";

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
    await recordOrder(session);
  }

  return NextResponse.json({ received: true });
}

async function recordOrder(session: Stripe.Checkout.Session) {
  const supabase = createServiceSupabase();
  if (!supabase) return;

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  const metadata = session.metadata ?? {};
  const email = session.customer_email || metadata.email || "";
  const items = (metadata.items ?? "")
    .split(",")
    .map((part) => {
      const [variantId, quantity] = part.split(":");
      return { variantId, quantity: Number(quantity) };
    })
    .filter((item) => item.variantId && item.quantity > 0);

  if (!email || items.length === 0) return;

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, price_cents, finish, material, color, stock, product:products(name)")
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
    .from("orders")
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

  if (error || !order) return;

  await supabase.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      variant_id: line.variantId,
      product_name: line.name,
      variant_label: line.label,
      unit_price_cents: line.unitPrice,
      quantity: line.quantity,
    })),
  );

  for (const line of lines) {
    await supabase
      .from("product_variants")
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
    // Email failure should not make Stripe retry the paid event forever.
  }
}

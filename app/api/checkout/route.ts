import { NextResponse } from "next/server";
import { buildOrder, publicOrderId, resolveLines, validateContact } from "@/lib/checkout";
import { sendOrderEmail } from "@/lib/email";
import { isStripeConfigured, siteUrl } from "@/lib/env";
import { listProducts } from "@/lib/repository";
import { getSessionUser } from "@/lib/access";
import type { CartLine } from "@/lib/types";

// One route, two endings. With STRIPE_SECRET_KEY I create a Checkout
// Session and return the hosted URL. Without it I build a paid order
// in memory and let the browser store it. The demo path never writes
// Postgres and never decrements stock.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    name?: string;
    address?: string;
    items?: CartLine[];
  } | null;

  if (!body) return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  const contact = validateContact(body);
  if (!contact.ok) return NextResponse.json({ error: contact.error }, { status: 400 });
  const products = await listProducts();
  const resolved = resolveLines(products, body.items ?? []);
  if (!resolved.ok) return NextResponse.json({ error: resolved.error }, { status: 400 });

  if (isStripeConfigured()) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // Prices were resolved above from the catalog. Metadata only carries
    // variant id and quantity, clipped to Stripe's 500-character cap.
    // The webhook reads price and name back from the database.
    const user = await getSessionUser();
    const compact = resolved.lines.map((line) => `${line.variantId}:${line.quantity}`).join(",");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: contact.email,
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/cart`,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: resolved.shippingCents === 0 ? "Complimentary shipping" : "Ground shipping",
            fixed_amount: { amount: resolved.shippingCents, currency: "usd" },
          },
        },
      ],
      line_items: resolved.lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: line.unitPriceCents,
          product_data: { name: `${line.productName} — ${line.variantLabel}` },
        },
      })),
      metadata: {
        email: contact.email,
        name: contact.name.slice(0, 200),
        address: contact.address.slice(0, 450),
        // Empty for a guest. I only attach a user id that getSessionUser
        // confirmed, so the client can't stick someone else's id here.
        userId: user?.id ?? "",
        items: compact.slice(0, 500),
      },
    });
    return NextResponse.json({ url: session.url });
  }

  const order = buildOrder({
    id: publicOrderId(),
    email: contact.email,
    name: contact.name,
    address: contact.address,
    lines: resolved.lines,
    subtotalCents: resolved.subtotalCents,
    shippingCents: resolved.shippingCents,
    totalCents: resolved.totalCents,
  });
  try {
    await sendOrderEmail(order);
  } catch {
    // A missing or rejected email does not fail the demo order. The
    // order is already built; the client is what stores it.
  }
  return NextResponse.json({ order });
}

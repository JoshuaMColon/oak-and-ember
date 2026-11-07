import { formatPrice } from "@/lib/money";
import type { Order } from "@/lib/types";

// Missing RESEND_API_KEY is a skip, not an error. Checkout and the
// webhook both treat a thrown failure the same way: the order stands.
// Name and address are escaped because they are interpolated into HTML.
export async function sendOrderEmail(order: Order) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true as const };

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "Oak & Ember <onboarding@resend.dev>";
  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0">${item.productName}<br><span style="color:#6e6258">${item.variantLabel}</span></td><td style="padding:8px 0;text-align:right">${item.quantity} × ${formatPrice(item.unitPriceCents)}</td></tr>`,
    )
    .join("");

  const { error } = await resend.emails.send({
    from,
    to: order.email,
    subject: `Your Oak & Ember order ${order.id}`,
    html: `<div style="font-family:Georgia,serif;color:#241c15;background:#f7f1e8;padding:32px">
      <p style="letter-spacing:.18em;text-transform:uppercase;font-size:12px">Oak & Ember</p>
      <h1 style="font-weight:400">Thank you, ${escapeHtml(order.name)}.</h1>
      <p>Order <strong>${order.id}</strong> is confirmed. We will write again when it leaves the workshop.</p>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <p>Shipping ${formatPrice(order.shippingCents)} · Total ${formatPrice(order.totalCents)}</p>
      <p style="color:#6e6258">${escapeHtml(order.address)}</p>
    </div>`,
  });

  if (error) return { skipped: false as const, error: error.message };
  return { skipped: false as const, error: null };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

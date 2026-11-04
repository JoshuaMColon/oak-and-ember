import Link from "next/link";
import { Suspense } from "react";
import { SuccessOrder } from "@/components/success-order";
import { isStripeConfigured } from "@/lib/env";
import { formatPrice } from "@/lib/money";

export const metadata = { title: "Order confirmed" };

export default function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Confirming your order…</p>}>
      <SuccessBody searchParams={searchParams} />
    </Suspense>
  );
}

async function SuccessBody({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderId = typeof params.order === "string" ? params.order : "";
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";

  if (orderId) return <SuccessOrder orderId={orderId} />;

  if (sessionId && isStripeConfigured()) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {paid ? "Payment received" : "Payment processing"}
        </p>
        <h1 className="mt-3 font-serif text-4xl">Thank you.</h1>
        <p className="mt-3 text-muted">
          {paid
            ? "Stripe accepted the test payment. The webhook records the order and sends a confirmation when Resend is configured."
            : "Stripe is still confirming this payment. Refresh in a moment."}
        </p>
        {session.amount_total != null ? (
          <p className="mt-4 text-lg">{formatPrice(session.amount_total)}</p>
        ) : null}
        <Link href="/account" className="mt-8 inline-flex rounded-full bg-ember-deep px-5 py-3 text-sm text-white">
          View account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-serif text-4xl">Thank you.</h1>
      <p className="mt-3 text-muted">Your order is confirmed.</p>
      <Link href="/catalog" className="mt-6 inline-flex underline">Continue shopping</Link>
    </div>
  );
}

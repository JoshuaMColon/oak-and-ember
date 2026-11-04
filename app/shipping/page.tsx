export const metadata = { title: "Shipping and returns" };

export default function ShippingPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-serif text-5xl">Shipping &amp; returns</h1>
      <div className="mt-6 space-y-4 leading-7 text-muted">
        <p>In-stock pieces leave the workshop within five business days. Made-to-order upholstery, when a finish shows zero stock, is quoted before anything is cut.</p>
        <p>Ground shipping is $75. Orders of $1,500 or more ship complimentary inside the continental United States.</p>
        <p>You can return an unused piece within 30 days. Upholstery that has been sat on comes home only if it arrived damaged — write to us with a photograph and the order number.</p>
        <p>This page describes the shop as it is meant to run. The demo checkout does not charge a card and does not dispatch a truck.</p>
      </div>
    </article>
  );
}

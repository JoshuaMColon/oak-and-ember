import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";
import { isStripeConfigured } from "@/lib/env";
import { listProducts } from "@/lib/repository";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Preparing checkout…</p>}>
      <CheckoutBody />
    </Suspense>
  );
}

async function CheckoutBody() {
  const products = await listProducts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm products={products} mode={isStripeConfigured() ? "stripe" : "demo"} />
      </div>
    </div>
  );
}

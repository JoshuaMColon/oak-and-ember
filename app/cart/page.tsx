import { Suspense } from "react";
import { CartView } from "@/components/cart-view";
import { listProducts } from "@/lib/repository";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Loading your cart…</p>}>
      <CartBody />
    </Suspense>
  );
}

async function CartBody() {
  const products = await listProducts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Cart</h1>
      <div className="mt-8">
        <CartView products={products} />
      </div>
    </div>
  );
}

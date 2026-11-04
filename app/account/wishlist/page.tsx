import { Suspense } from "react";
import { WishlistView } from "@/components/wishlist-view";
import { listProducts } from "@/lib/repository";

export const metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-muted">Loading your wishlist…</p>}>
      <WishlistBody />
    </Suspense>
  );
}

async function WishlistBody() {
  const products = await listProducts();
  return <WishlistView products={products} />;
}

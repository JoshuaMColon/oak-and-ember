"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { useShop } from "@/components/shop-provider";
import type { Product } from "@/lib/types";

export function WishlistView({ products }: { products: Product[] }) {
  const shop = useShop();
  const saved = products.filter((product) => shop.wishlist.includes(product.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-4xl">Wishlist</h1>
      {!shop.ready ? <p className="mt-4 text-muted">Loading saved pieces…</p> : null}
      {shop.ready && saved.length === 0 ? (
        <p className="mt-4 text-muted">
          Nothing saved yet. Tap the heart on a piece, or <Link className="underline" href="/catalog">browse the shop</Link>.
        </p>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

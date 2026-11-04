"use client";

import Link from "next/link";
import { MediaImage } from "@/components/media-image";
import { useShop } from "@/components/shop-provider";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const shop = useShop();
  const variant = product.variants.find((item) => item.stock > 0) ?? product.variants[0];
  const soldOut = product.variants.every((item) => item.stock <= 0);
  const wished = shop.wished(product.id);

  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e7dfd3] dark:bg-[#2a241e]">
          {product.images[0] ? (
            <MediaImage
              src={product.images[0].src}
              alt={product.images[0].alt}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="transition duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{product.category}</p>
            <h3 className="mt-1 font-serif text-xl leading-tight">{product.name}</h3>
          </div>
          <p className="shrink-0 text-sm">{formatPrice(product.priceCents)}</p>
        </div>
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={soldOut || !variant}
          title={soldOut ? "Sold out" : `Add ${product.name} to cart`}
          onClick={() => variant && shop.add(variant.id, 1, variant.stock)}
          className="h-9 rounded-full bg-ember-deep px-4 text-xs font-medium text-white transition hover:bg-[#722f10] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-ember dark:text-[#1a120c] dark:hover:bg-[#f0a57a]"
        >
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
        <button
          type="button"
          title={wished ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wished}
          onClick={() => shop.toggleWish(product.id)}
          className="grid h-9 w-9 place-items-center rounded-full border border-line transition hover:bg-ink/5 active:scale-95"
        >
          <span className="sr-only">{wished ? "Remove from wishlist" : "Save to wishlist"}</span>
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
        </button>
      </div>
    </article>
  );
}

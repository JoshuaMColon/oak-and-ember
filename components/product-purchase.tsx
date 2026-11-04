"use client";

import { useMemo, useState } from "react";
import { useShop } from "@/components/shop-provider";
import { averageRating } from "@/lib/catalog-query";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductPurchase({ product }: { product: Product }) {
  const shop = useShop();
  const initial = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(initial?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants.find((item) => item.id === variantId) ?? initial;
  const rating = averageRating(product);
  const wished = shop.wished(product.id);
  const stockLabel = useMemo(() => {
    if (!variant) return "Unavailable";
    if (variant.stock <= 0) return "Out of stock";
    if (variant.stock < 4) return `Only ${variant.stock} left in this finish`;
    return "In stock, ships within five business days";
  }, [variant]);

  if (!variant) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{product.category}</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{product.name}</h1>
      <div className="mt-3 flex items-center gap-3">
        <p className="text-lg">{formatPrice(variant.priceCents)}</p>
        {product.reviews.length > 0 ? (
          <p className="text-sm text-muted">
            <span aria-label={`${rating.toFixed(1)} out of 5 stars`}>{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>
            <span className="ml-2">{rating.toFixed(1)} · {product.reviews.length} reviews</span>
          </p>
        ) : (
          <p className="text-sm text-muted">No reviews yet</p>
        )}
      </div>
      <p className="mt-5 leading-7 text-muted">{product.description}</p>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Finish and material</legend>
        <div className="mt-3 flex flex-col gap-2">
          {product.variants.map((option) => {
            const selected = option.id === variant.id;
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-3 transition hover:border-oak ${selected ? "border-ink bg-surface" : "border-line"}`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="variant"
                    value={option.id}
                    checked={selected}
                    onChange={() => {
                      setVariantId(option.id);
                      setQuantity(1);
                    }}
                    className="accent-[#8d3c16]"
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-line"
                    style={{ background: option.colorHex }}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm">{option.finish}</span>
                    <span className="block text-xs text-muted">{option.material} · {option.color}</span>
                  </span>
                </span>
                <span className="text-sm">{formatPrice(option.priceCents)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className={`mt-4 text-sm ${variant.stock > 0 ? "text-good" : "text-warn"}`} role="status">
        {stockLabel}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="text-sm">
          <span className="sr-only">Quantity</span>
          <input
            type="number"
            min={1}
            max={Math.max(1, Math.min(variant.stock, 12))}
            value={quantity}
            disabled={variant.stock <= 0}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="h-12 w-20 rounded-full border border-line bg-surface px-3 text-center"
          />
        </label>
        <button
          type="button"
          disabled={variant.stock <= 0}
          title={`Add ${product.name} to cart`}
          onClick={() => shop.add(variant.id, quantity, variant.stock)}
          className="h-12 flex-1 rounded-full bg-ember-deep px-6 text-sm font-medium text-white transition hover:bg-[#722f10] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-ember dark:text-[#1a120c] sm:flex-none"
        >
          Add to cart
        </button>
        <button
          type="button"
          title={wished ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wished}
          onClick={() => shop.toggleWish(product.id)}
          className="h-12 rounded-full border border-line px-4 text-sm transition hover:bg-surface active:scale-[0.98]"
        >
          {wished ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

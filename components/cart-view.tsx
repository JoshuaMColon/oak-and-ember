"use client";

import Link from "next/link";
import { findVariant, useShop } from "@/components/shop-provider";
import { MediaImage } from "@/components/media-image";
import { formatPrice, shippingCents } from "@/lib/money";
import type { Product } from "@/lib/types";

export function CartView({ products }: { products: Product[] }) {
  const shop = useShop();
  const rows = shop.lines
    .map((line) => {
      const found = findVariant(products, line.variantId);
      return found ? { ...found, quantity: line.quantity } : null;
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const subtotal = rows.reduce((sum, row) => sum + row.variant.priceCents * row.quantity, 0);
  const shipping = shippingCents(subtotal);

  if (!shop.ready) return <p className="text-muted">Loading your cart…</p>;

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line p-10 text-center">
        <h2 className="font-serif text-3xl">Your cart is empty.</h2>
        <p className="mt-2 text-muted">The floor is open.</p>
        <Link href="/catalog" className="mt-5 inline-flex h-11 items-center rounded-full bg-ember-deep px-5 text-sm text-white">
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <ul className="space-y-6">
        {rows.map((row) => (
          <li key={row.variant.id} className="flex gap-4 border-b border-line pb-6">
            <Link href={`/products/${row.product.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#e7dfd3]">
              {row.product.images[0] ? (
                <MediaImage src={row.product.images[0].src} alt="" sizes="96px" />
              ) : null}
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/products/${row.product.slug}`} className="font-serif text-xl hover:underline">
                    {row.product.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {row.variant.finish} · {row.variant.material} · {row.variant.color}
                  </p>
                </div>
                <p>{formatPrice(row.variant.priceCents * row.quantity)}</p>
              </div>
              <div className="mt-auto flex items-center gap-3 pt-3">
                <label className="text-sm">
                  <span className="sr-only">Quantity for {row.product.name}</span>
                  <input
                    type="number"
                    min={1}
                    max={Math.min(row.variant.stock, 12)}
                    value={row.quantity}
                    onChange={(event) => shop.setQuantity(row.variant.id, Number(event.target.value), row.variant.stock)}
                    className="h-10 w-16 rounded-full border border-line bg-surface text-center"
                  />
                </label>
                <button
                  type="button"
                  title={`Remove ${row.product.name}`}
                  onClick={() => shop.remove(row.variant.id)}
                  className="text-sm underline-offset-2 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-3xl border border-line bg-surface p-5">
        <h2 className="font-serif text-2xl">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base">
            <dt>Total</dt><dd>{formatPrice(subtotal + shipping)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">Complimentary shipping on orders of $1,500 or more. Otherwise $75.</p>
        <Link
          href="/checkout"
          className="mt-5 flex h-12 items-center justify-center rounded-full bg-ember-deep text-sm font-medium text-white transition hover:bg-[#722f10] active:scale-[0.98] dark:bg-ember dark:text-[#1a120c]"
        >
          Checkout
        </Link>
      </aside>
    </div>
  );
}

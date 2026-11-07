"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { readLocal, writeLocal } from "@/lib/browser-store";
import { findVariant, useShop } from "@/components/shop-provider";
import { formatPrice, shippingCents } from "@/lib/money";
import type { Order, Product } from "@/lib/types";

// Posts variant ids and quantities. The server prices them. A JSON
// order is the demo path: I keep it on this device and clear the cart.
// A url is Stripe's hosted page. I leave the cart in place on that
// path so a cancel back to /cart still has the lines.
export function CheckoutForm({
  products,
  mode,
}: {
  products: Product[];
  mode: "stripe" | "demo";
}) {
  const shop = useShop();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const rows = shop.lines
    .map((line) => {
      const found = findVariant(products, line.variantId);
      return found ? { ...found, quantity: line.quantity } : null;
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const subtotal = rows.reduce((sum, row) => sum + row.variant.priceCents * row.quantity, 0);
  const shipping = shippingCents(subtotal);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          address,
          items: shop.lines,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        url?: string;
        order?: Order;
      };
      if (!response.ok || data.error) {
        setError(data.error || "Checkout could not start.");
        setPending(false);
        return;
      }
      if (data.order) {
        const existing = readLocal<Order[]>("oak-ember-orders", []);
        writeLocal("oak-ember-orders", [data.order, ...existing]);
        shop.clear();
        router.push(`/checkout/success?order=${encodeURIComponent(data.order.id)}`);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Checkout did not return a next step.");
      setPending(false);
    } catch {
      setError("Checkout could not reach the server.");
      setPending(false);
    }
  }

  if (shop.ready && rows.length === 0) {
    return <p className="text-muted">Your cart is empty. Add a piece before checking out.</p>;
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <p className="rounded-2xl bg-surface px-4 py-3 text-sm text-muted">
          {mode === "stripe"
            ? "You will finish payment on Stripe. Use test card 4242 4242 4242 4242, any future date, and any CVC."
            : "Stripe is not configured, so this checkout simulates a successful payment. No card number is collected."}
        </p>
        <label className="block text-sm">
          Email
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3" />
        </label>
        <label className="block text-sm">
          Full name
          <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3" />
        </label>
        <label className="block text-sm">
          Delivery address
          <textarea required value={address} onChange={(event) => setAddress(event.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2" />
        </label>
        {error ? <p className="text-sm text-warn" role="alert">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || rows.length === 0}
          className="h-12 rounded-full bg-ember-deep px-6 text-sm font-medium text-white transition hover:bg-[#722f10] active:scale-[0.98] disabled:opacity-60 dark:bg-ember dark:text-[#1a120c]"
        >
          {pending ? "Working…" : mode === "stripe" ? "Continue to payment" : "Place order"}
        </button>
      </div>
      <aside className="h-fit rounded-3xl border border-line bg-surface p-5">
        <h2 className="font-serif text-2xl">Your order</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {rows.map((row) => (
            <li key={row.variant.id} className="flex justify-between gap-3">
              <span>{row.product.name} × {row.quantity}</span>
              <span>{formatPrice(row.variant.priceCents * row.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-line pt-3 text-sm">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</span>
        </p>
        <p className="mt-2 flex justify-between font-medium">
          <span>Total</span>
          <span>{formatPrice(subtotal + shipping)}</span>
        </p>
      </aside>
    </form>
  );
}


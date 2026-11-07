"use client";

import Link from "next/link";
import { useLocal } from "@/lib/browser-store";
import { formatPrice } from "@/lib/money";
import type { Order } from "@/lib/types";

const emptyOrders: Order[] = [];

export function AccountPanel({
  user,
  orders,
  supabase,
}: {
  user: { name: string; email: string } | null;
  orders: Order[];
  supabase: boolean;
}) {
  const localOrders = useLocal<Order[]>("oak-ember-orders", emptyOrders);

  // Server orders win when a public id exists in both places, so a demo
  // checkout and a later real order don't show up as two rows.
  const seen = new Set(orders.map((order) => order.id));
  const combined = [...orders, ...localOrders.filter((order) => !seen.has(order.id))];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Account</p>
      <h1 className="mt-2 font-serif text-4xl">{user ? user.name : "Your house account"}</h1>
      <p className="mt-2 text-muted">
        {user
          ? user.email
          : supabase
            ? "Sign in to see orders placed on your account."
            : "Supabase is not connected, so orders from this browser stay on this device."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {!user ? (
          <Link href="/login" className="rounded-full bg-ember-deep px-4 py-2 text-sm text-white">Sign in</Link>
        ) : (
          <form action="/auth/signout" method="post">
            <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm hover:bg-surface" title="Log out">
              Log out
            </button>
          </form>
        )}
        <Link href="/account/wishlist" className="rounded-full border border-line px-4 py-2 text-sm hover:bg-surface">Wishlist</Link>
        <Link href="/demo" className="rounded-full border border-line px-4 py-2 text-sm hover:bg-surface">Admin demo</Link>
      </div>

      <h2 className="mt-12 font-serif text-2xl">Orders</h2>
      {combined.length === 0 ? (
        <p className="mt-3 text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-3xl border border-line">
          {combined.map((order) => (
            <li key={order.id}>
              <Link href={`/account/orders/${order.id}`} className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-surface">
                <span>
                  <span className="block font-medium">{order.id}</span>
                  <span className="text-sm capitalize text-muted">{order.status} · {order.createdAt.slice(0, 10)}</span>
                </span>
                <span>{formatPrice(order.totalCents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

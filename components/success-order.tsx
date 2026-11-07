"use client";

import Link from "next/link";
import { useLocal } from "@/lib/browser-store";
import { formatPrice } from "@/lib/money";
import type { Order } from "@/lib/types";

const emptyOrders: Order[] = [];

// Demo confirmation. The order was returned by /api/checkout and
// written to localStorage by the form. It is not in Postgres.
export function SuccessOrder({ orderId }: { orderId: string }) {
  const orders = useLocal<Order[]>("oak-ember-orders", emptyOrders);
  const order = orders.find((item) => item.id === orderId) ?? null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Order confirmed</p>
      <h1 className="mt-3 font-serif text-4xl">Thank you.</h1>
      <p className="mt-3 text-muted">
        {order
          ? `${order.id} is paid in this demo. A copy is saved on this device under your account page.`
          : `Order ${orderId} is confirmed.`}
      </p>
      {order ? (
        <p className="mt-4 text-lg">{formatPrice(order.totalCents)}</p>
      ) : null}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/account" className="rounded-full bg-ember-deep px-5 py-3 text-sm text-white">View orders</Link>
        <Link href="/catalog" className="rounded-full border border-line px-5 py-3 text-sm">Keep shopping</Link>
      </div>
    </div>
  );
}

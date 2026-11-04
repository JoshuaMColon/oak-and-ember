"use client";

import Link from "next/link";
import { useLocal } from "@/lib/browser-store";
import { formatPrice } from "@/lib/money";
import type { Order } from "@/lib/types";

const emptyOrders: Order[] = [];

export function OrderDetail({ orderId, serverOrder }: { orderId: string; serverOrder: Order | null }) {
  const localOrders = useLocal<Order[]>("oak-ember-orders", emptyOrders);
  const order = serverOrder ?? localOrders.find((item) => item.id === orderId) ?? null;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-4xl">Order not found</h1>
        <Link href="/account" className="mt-4 inline-flex underline">Back to account</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/account" className="text-sm text-muted hover:underline">Account</Link>
      <h1 className="mt-3 font-serif text-4xl">{order.id}</h1>
      <p className="mt-2 capitalize text-muted">{order.status} · {order.createdAt.slice(0, 10)}</p>
      <ul className="mt-8 divide-y divide-line">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-4">
            <span>
              <span className="block">{item.productName}</span>
              <span className="text-sm text-muted">{item.variantLabel} · Qty {item.quantity}</span>
            </span>
            <span>{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotalCents)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>{formatPrice(order.shippingCents)}</dd></div>
        <div className="flex justify-between text-base"><dt>Total</dt><dd>{formatPrice(order.totalCents)}</dd></div>
      </dl>
      <p className="mt-6 text-sm text-muted">{order.name}<br />{order.address}<br />{order.email}</p>
    </div>
  );
}

import type { Order, OrderStatus, Product } from "@/lib/types";

const COUNTED: OrderStatus[] = ["paid", "shipped", "delivered"];

export function countedOrders(orders: Order[]) {
  return orders.filter((order) => COUNTED.includes(order.status));
}

export function salesSummary(orders: Order[]) {
  const counted = countedOrders(orders);
  const revenueCents = counted.reduce((sum, order) => sum + order.totalCents, 0);
  const units = counted.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  return {
    revenueCents,
    orderCount: counted.length,
    averageCents: counted.length ? Math.round(revenueCents / counted.length) : 0,
    units,
  };
}

export function salesByMonth(orders: Order[]) {
  const map = new Map<string, number>();
  for (const order of countedOrders(orders)) {
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + order.totalCents);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, cents]) => {
      const [year, month] = key.split("-");
      const label = new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toLocaleString(
        "en-US",
        { month: "short", timeZone: "UTC" },
      );
      return { key, label, cents };
    });
}

export function lowStock(products: Product[], threshold = 2) {
  return products.flatMap((product) =>
    product.variants
      .filter((variant) => variant.stock <= threshold)
      .map((variant) => ({ product, variant })),
  );
}

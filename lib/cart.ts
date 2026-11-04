import type { CartLine } from "@/lib/types";

export function mergeCartLines(guest: CartLine[], remote: CartLine[]): CartLine[] {
  const map = new Map<string, number>();
  for (const line of [...remote, ...guest]) {
    if (!line.variantId || line.quantity < 1) continue;
    map.set(line.variantId, (map.get(line.variantId) ?? 0) + line.quantity);
  }
  return [...map.entries()].map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));
}

export function mergeWishlists(guest: string[], remote: string[]) {
  return [...new Set([...remote, ...guest].filter(Boolean))];
}

export function clampQuantity(quantity: number, stock: number) {
  if (stock <= 0) return 0;
  return Math.min(Math.max(1, Math.floor(quantity)), Math.min(stock, 12));
}

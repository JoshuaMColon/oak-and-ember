import type { CartLine } from "@/lib/types";

// Guest lines are applied after the saved cart, and quantities add.
// I don't replace a remote line with the guest one: someone who added
// a chair on their phone and the same chair as a guest in this browser
// should end up with both. Empty ids and zero quantities are dropped
// so a bad payload can't create a line. Called once, the first time a
// browser syncs to a signed-in user.
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

// Hard cap of 12, and never above stock. Checkout checks the same
// bounds again; this only stops the cart UI from staging a quantity
// the server will reject. Zero stock clears the line.
export function clampQuantity(quantity: number, stock: number) {
  if (stock <= 0) return 0;
  return Math.min(Math.max(1, Math.floor(quantity)), Math.min(stock, 12));
}

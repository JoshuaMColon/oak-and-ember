import { shippingCents } from "@/lib/money";
import type { CartLine, Order, OrderItem, Product } from "@/lib/types";

export interface ResolvedLine extends OrderItem {
  productSlug: string;
}

export function resolveLines(products: Product[], lines: CartLine[]) {
  const variants = new Map(
    products.flatMap((product) =>
      product.variants.map((variant) => [variant.id, { product, variant }] as const),
    ),
  );
  const resolved: ResolvedLine[] = [];
  for (const line of lines) {
    const found = variants.get(line.variantId);
    if (!found) {
      return { ok: false as const, error: "A piece in your cart is no longer available." };
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 12) {
      return { ok: false as const, error: "Check the quantities in your cart." };
    }
    if (found.variant.stock < line.quantity) {
      return {
        ok: false as const,
        error: `${found.product.name} has ${found.variant.stock} in stock in that finish.`,
      };
    }
    resolved.push({
      id: `${found.variant.id}-${line.quantity}`,
      variantId: found.variant.id,
      productName: found.product.name,
      productSlug: found.product.slug,
      variantLabel: `${found.variant.finish} · ${found.variant.material} · ${found.variant.color}`,
      unitPriceCents: found.variant.priceCents,
      quantity: line.quantity,
      image: found.product.images[0]?.src,
    });
  }
  if (resolved.length === 0) {
    return { ok: false as const, error: "Your cart is empty." };
  }
  const subtotalCents = resolved.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );
  const shipping = shippingCents(subtotalCents);
  return {
    ok: true as const,
    lines: resolved,
    subtotalCents,
    shippingCents: shipping,
    totalCents: subtotalCents + shipping,
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: { email?: string; name?: string; address?: string }) {
  const email = input.email?.trim() ?? "";
  const name = input.name?.trim() ?? "";
  const address = input.address?.trim() ?? "";
  if (!EMAIL.test(email)) return { ok: false as const, error: "Enter a valid email address." };
  if (name.length < 2) return { ok: false as const, error: "Enter the name for the delivery." };
  if (address.length < 8) return { ok: false as const, error: "Enter a delivery address." };
  return { ok: true as const, email, name, address };
}

export function buildOrder(input: {
  id: string;
  email: string;
  name: string;
  address: string;
  lines: ResolvedLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt?: string;
}): Order {
  return {
    id: input.id,
    email: input.email,
    name: input.name,
    address: input.address,
    status: "paid",
    subtotalCents: input.subtotalCents,
    shippingCents: input.shippingCents,
    totalCents: input.totalCents,
    createdAt: input.createdAt ?? new Date().toISOString(),
    items: input.lines.map((line) => ({
      id: line.id,
      variantId: line.variantId,
      productName: line.productName,
      variantLabel: line.variantLabel,
      unitPriceCents: line.unitPriceCents,
      quantity: line.quantity,
      image: line.image,
    })),
  };
}

export function publicOrderId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `OE-${n}`;
}

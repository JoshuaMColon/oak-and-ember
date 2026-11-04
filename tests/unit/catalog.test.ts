import { describe, expect, it } from "vitest";
import { mergeCartLines, mergeWishlists } from "@/lib/cart";
import { filterProducts, normalizeQuery, paginate, queryCatalog, sortProducts } from "@/lib/catalog-query";
import { buildOrder, resolveLines, validateContact } from "@/lib/checkout";
import { products } from "@/lib/data/catalog";
import { shippingCents } from "@/lib/money";
import { salesSummary } from "@/lib/sales";
import { sampleOrders } from "@/lib/data/orders";
import type { Product } from "@/lib/types";

describe("catalog", () => {
  it("seeds six categories and 24 products", () => {
    const categories = new Set(products.map((product) => product.category));
    expect(categories.size).toBe(6);
    expect(products).toHaveLength(24);
    expect(products.every((product) => product.variants.length > 0 && product.images.length > 0)).toBe(true);
  });

  it("searches by name and material", () => {
    const query = normalizeQuery({ q: "calder" });
    const result = queryCatalog(products, query);
    expect(result.items.map((product) => product.slug)).toEqual(["calder-lounge-sofa"]);

    const oak = filterProducts(products, normalizeQuery({ material: "Oak" }));
    expect(oak.length).toBeGreaterThan(3);
    expect(oak.every((product) => product.variants.some((variant) => variant.material === "Oak"))).toBe(true);
  });

  it("filters price, color, and paginates", () => {
    const query = normalizeQuery({ min: "2000", max: "3000", color: "Sand", page: "1" });
    const result = queryCatalog(products, query);
    expect(result.items.every((product) => product.priceCents >= 200_000 && product.priceCents <= 300_000)).toBe(true);
    expect(result.items.every((product) => product.variants.some((variant) => variant.color === "Sand"))).toBe(true);

    const pages = paginate([1, 2, 3, 4, 5], 2, 2);
    expect(pages.items).toEqual([3, 4]);
    expect(pages.pageCount).toBe(3);
  });

  it("sorts by price", () => {
    const sorted = sortProducts(products, "price-asc");
    expect(sorted[0].priceCents).toBeLessThanOrEqual(sorted[1].priceCents);
    expect(sorted.at(-1)!.priceCents).toBeGreaterThanOrEqual(sorted[0].priceCents);
  });
});

describe("cart and checkout", () => {
  it("merges guest and account carts", () => {
    expect(
      mergeCartLines(
        [{ variantId: "a", quantity: 1 }, { variantId: "b", quantity: 2 }],
        [{ variantId: "a", quantity: 3 }],
      ),
    ).toEqual([
      { variantId: "a", quantity: 4 },
      { variantId: "b", quantity: 2 },
    ]);
    expect(mergeWishlists(["p1"], ["p1", "p2"])).toEqual(["p1", "p2"]);
  });

  it("charges shipping under the threshold", () => {
    expect(shippingCents(100_000)).toBe(7500);
    expect(shippingCents(150_000)).toBe(0);
  });

  it("rejects a bad email and an oversold finish", () => {
    expect(validateContact({ email: "nope", name: "Ada", address: "1 Main Street" }).ok).toBe(false);
    const product = products[0];
    const variant = product.variants.find((item) => item.stock > 0)!;
    const resolved = resolveLines(products, [{ variantId: variant.id, quantity: variant.stock + 1 }]);
    expect(resolved.ok).toBe(false);
  });

  it("builds a paid demo order", () => {
    const product = products.find((item) => item.slug === "kiln-table-lamp") as Product;
    const variant = product.variants[0];
    const resolved = resolveLines(products, [{ variantId: variant.id, quantity: 1 }]);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    const order = buildOrder({
      id: "OE-424242",
      email: "guest@example.com",
      name: "Guest",
      address: "1 Oak Street",
      lines: resolved.lines,
      subtotalCents: resolved.subtotalCents,
      shippingCents: resolved.shippingCents,
      totalCents: resolved.totalCents,
    });
    expect(order.status).toBe("paid");
    expect(order.totalCents).toBe(resolved.totalCents);
  });
});

describe("sales", () => {
  it("ignores cancelled orders", () => {
    const summary = salesSummary(sampleOrders);
    const cancelled = sampleOrders.find((order) => order.status === "cancelled");
    expect(summary.orderCount).toBe(sampleOrders.length - 1);
    expect(summary.revenueCents).toBeLessThan(
      sampleOrders.reduce((sum, order) => sum + order.totalCents, 0),
    );
    expect(cancelled).toBeTruthy();
  });
});

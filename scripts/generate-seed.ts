import { writeFileSync } from "node:fs";
import { categories, products } from "../lib/data/catalog";
import { orderRecordId, sampleOrders } from "../lib/data/orders";

function sql(value: string | null | undefined) {
  if (value == null) return "null";
  return `'${value.replaceAll("'", "''")}'`;
}

function keywords(product: (typeof products)[number]) {
  return [
    product.category,
    ...product.variants.flatMap((variant) => [variant.finish, variant.material, variant.color]),
  ].join(" ");
}

const lines: string[] = [
  "-- Generated from lib/data/catalog.ts and lib/data/orders.ts",
  "-- Run after the init migration, on an empty catalog.",
  "begin;",
];

for (const category of categories) {
  lines.push(
    `insert into public.categories (id, slug, name, description, image) values (${sql(category.id)}, ${sql(category.slug)}, ${sql(category.name)}, ${sql(category.description)}, ${sql(category.image)});`,
  );
}

for (const product of products) {
  const category = categories.find((item) => item.slug === product.category);
  const details = `array[${product.details.map((detail) => sql(detail)).join(", ")}]::text[]`;
  lines.push(
    `insert into public.products (id, category_id, slug, name, description, details, price_cents, featured, bestseller, keywords, created_at) values (${sql(product.id)}, ${sql(category?.id)}, ${sql(product.slug)}, ${sql(product.name)}, ${sql(product.description)}, to_jsonb(${details}), ${product.priceCents}, ${product.featured}, ${product.bestseller}, ${sql(keywords(product))}, ${sql(product.createdAt + "T00:00:00Z")});`,
  );
  product.images.forEach((image, index) => {
    lines.push(
      `insert into public.product_images (id, product_id, url, alt, credit, sort_order) values (${sql(image.id)}, ${sql(product.id)}, ${sql(image.src)}, ${sql(image.alt)}, ${sql(image.credit)}, ${index});`,
    );
  });
  for (const variant of product.variants) {
    lines.push(
      `insert into public.product_variants (id, product_id, sku, finish, material, color, color_hex, price_cents, stock) values (${sql(variant.id)}, ${sql(product.id)}, ${sql(variant.sku)}, ${sql(variant.finish)}, ${sql(variant.material)}, ${sql(variant.color)}, ${sql(variant.colorHex)}, ${variant.priceCents}, ${variant.stock});`,
    );
  }
  for (const review of product.reviews) {
    lines.push(
      `insert into public.reviews (id, product_id, author_name, rating, title, body, created_at) values (${sql(review.id)}, ${sql(product.id)}, ${sql(review.author)}, ${review.rating}, ${sql(review.title)}, ${sql(review.body)}, ${sql(review.createdAt + "T00:00:00Z")});`,
    );
  }
}

sampleOrders.forEach((order, index) => {
  const id = orderRecordId(index + 1);
  lines.push(
    `insert into public.orders (id, public_id, email, status, subtotal_cents, shipping_cents, total_cents, shipping_name, shipping_address, created_at) values (${sql(id)}, ${sql(order.id)}, ${sql(order.email)}, ${sql(order.status)}, ${order.subtotalCents}, ${order.shippingCents}, ${order.totalCents}, ${sql(order.name)}, ${sql(order.address)}, ${sql(order.createdAt)});`,
  );
  for (const item of order.items) {
    lines.push(
      `insert into public.order_items (id, order_id, variant_id, product_name, variant_label, unit_price_cents, quantity) values (${sql(item.id)}, ${sql(id)}, ${sql(item.variantId)}, ${sql(item.productName)}, ${sql(item.variantLabel)}, ${item.unitPriceCents}, ${item.quantity});`,
    );
  }
});

lines.push("commit;");
writeFileSync("supabase/seed.sql", lines.join("\n") + "\n");
console.log(`Wrote supabase/seed.sql (${lines.length} statements)`);

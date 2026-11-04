import { uid } from "@/lib/ids";
import { shippingCents } from "@/lib/money";
import { products } from "@/lib/data/catalog";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

const ORDER_GROUP = 6;
const ITEM_GROUP = 7;

function variant(slug: string, index: number) {
  const product = products.find((item) => item.slug === slug);
  if (!product) throw new Error(`Unknown product ${slug}`);
  const chosen = product.variants[index];
  if (!chosen) throw new Error(`Unknown variant ${slug}#${index}`);
  return { product, variant: chosen };
}

let itemCounter = 0;

function item(slug: string, index: number, quantity: number): OrderItem {
  const found = variant(slug, index);
  itemCounter += 1;
  const label = `${found.variant.finish} · ${found.variant.material} · ${found.variant.color}`;
  return {
    id: uid(ITEM_GROUP, itemCounter),
    variantId: found.variant.id,
    productName: found.product.name,
    variantLabel: label,
    unitPriceCents: found.variant.priceCents,
    quantity,
    image: found.product.images[0]?.src,
  };
}

function order(input: {
  n: number;
  email: string;
  name: string;
  address: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}): Order {
  const subtotalCents = input.items.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );
  const shipping = shippingCents(subtotalCents);
  return {
    id: `OE-${1000 + input.n}`,
    email: input.email,
    name: input.name,
    address: input.address,
    status: input.status,
    subtotalCents,
    shippingCents: shipping,
    totalCents: subtotalCents + shipping,
    createdAt: input.createdAt,
    items: input.items,
  };
}

export const sampleOrders: Order[] = [
  order({
    n: 1,
    email: "helen.cho@example.com",
    name: "Helen Cho",
    address: "18 Willow Street, Hudson, NY 12534",
    status: "delivered",
    createdAt: "2026-05-12T15:04:00.000Z",
    items: [item("calder-lounge-sofa", 0, 1), item("kiln-table-lamp", 0, 2)],
  }),
  order({
    n: 2,
    email: "marcus.adeyemi@example.com",
    name: "Marcus Adeyemi",
    address: "440 Bergen Street, Brooklyn, NY 11217",
    status: "delivered",
    createdAt: "2026-06-03T18:22:00.000Z",
    items: [item("linden-dining-table", 0, 1), item("rowan-dining-chair", 0, 6)],
  }),
  order({
    n: 3,
    email: "priya.shah@example.com",
    name: "Priya Shah",
    address: "9 Elm Avenue, Providence, RI 02906",
    status: "shipped",
    createdAt: "2026-06-28T13:10:00.000Z",
    items: [item("solstice-platform-bed", 1, 1)],
  }),
  order({
    n: 4,
    email: "ruth.keller@example.com",
    name: "Ruth Keller",
    address: "210 Court Street, Cincinnati, OH 45202",
    status: "delivered",
    createdAt: "2026-07-09T16:41:00.000Z",
    items: [item("ember-sideboard", 0, 1), item("grove-side-table", 0, 1)],
  }),
  order({
    n: 5,
    email: "andre.silva@example.com",
    name: "Andre Silva",
    address: "77 King Street, Charleston, SC 29401",
    status: "paid",
    createdAt: "2026-08-02T20:05:00.000Z",
    items: [item("wren-armchair", 0, 1), item("grove-side-table", 1, 1)],
  }),
  order({
    n: 6,
    email: "jonah.ellis@example.com",
    name: "Jonah Ellis",
    address: "5 Harbor Lane, Portland, ME 04101",
    status: "cancelled",
    createdAt: "2026-08-19T11:18:00.000Z",
    items: [item("hollow-wardrobe", 0, 1)],
  }),
  order({
    n: 7,
    email: "naomi.berg@example.com",
    name: "Naomi Berg",
    address: "880 Valencia Street, San Francisco, CA 94110",
    status: "shipped",
    createdAt: "2026-09-07T19:33:00.000Z",
    items: [item("ember-sectional", 0, 1)],
  }),
  order({
    n: 8,
    email: "leila.hassan@example.com",
    name: "Leila Hassan",
    address: "14 Maple Court, Ann Arbor, MI 48104",
    status: "paid",
    createdAt: "2026-09-22T14:55:00.000Z",
    items: [item("ash-writing-desk", 0, 1), item("arc-floor-lamp", 0, 1)],
  }),
  order({
    n: 9,
    email: "owen.park@example.com",
    name: "Owen Park",
    address: "300 Burnet Avenue, Cincinnati, OH 45219",
    status: "delivered",
    createdAt: "2026-10-04T17:12:00.000Z",
    items: [item("archive-bookcase", 0, 1), item("alcove-sconce", 0, 1)],
  }),
  order({
    n: 10,
    email: "chris.dalton@example.com",
    name: "Chris Dalton",
    address: "62 College Street, Burlington, VT 05401",
    status: "paid",
    createdAt: "2026-10-18T21:08:00.000Z",
    items: [item("hearth-loveseat", 0, 1), item("cinder-coffee-table", 0, 1)],
  }),
];

export function orderRecordId(n: number) {
  return uid(ORDER_GROUP, n);
}

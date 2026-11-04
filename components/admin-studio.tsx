"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { readLocal, useLocal, writeLocal } from "@/lib/browser-store";
import {
  deleteProduct,
  saveProduct,
  updateOrderStatus,
  updateVariantStock,
  type ProductInput,
} from "@/app/admin/actions";
import { SalesChart } from "@/components/sales-chart";
import { formatPrice } from "@/lib/money";
import { lowStock, salesByMonth, salesSummary } from "@/lib/sales";
import { CATEGORY_SLUGS, type Category, type Order, type OrderStatus, type Product } from "@/lib/types";

const PRODUCT_KEY = "oak-ember-demo-catalog";
const ORDER_KEY = "oak-ember-demo-orders";
const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export function AdminOverview({
  products,
  orders,
  mode,
}: {
  products: Product[];
  orders: Order[];
  mode: "demo" | "admin";
}) {
  const storedOrders = useLocal<Order[] | null>(ORDER_KEY, null);
  const storedProducts = useLocal<Product[] | null>(PRODUCT_KEY, null);
  const liveOrders = mode === "demo" && storedOrders ? storedOrders : orders;
  const liveProducts = mode === "demo" && storedProducts ? storedProducts : products;
  const summary = salesSummary(liveOrders);
  const points = salesByMonth(liveOrders);
  const scarce = lowStock(liveProducts);

  return (
    <div>
      <PageTitle eyebrow={mode === "demo" ? "Demo" : "Studio"} title="Overview" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatPrice(summary.revenueCents)} />
        <Stat label="Paid orders" value={String(summary.orderCount)} />
        <Stat label="Average order" value={formatPrice(summary.averageCents)} />
        <Stat label="Low stock" value={String(scarce.length)} />
      </div>
      <section className="mt-8 rounded-3xl border border-line bg-surface p-5">
        <h2 className="font-serif text-2xl">Sales</h2>
        <p className="mb-4 text-sm text-muted">
          {mode === "demo" ? "Sample orders from the seeded studio, editable in this browser." : "Paid, shipped, and delivered orders."}
        </p>
        <SalesChart points={points} />
      </section>
      <section className="mt-8">
        <h2 className="font-serif text-2xl">Needs a look</h2>
        <ul className="mt-3 divide-y divide-line rounded-3xl border border-line">
          {scarce.slice(0, 6).map(({ product, variant }) => (
            <li key={variant.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{product.name} · {variant.finish}</span>
              <span className={variant.stock === 0 ? "text-warn" : ""}>{variant.stock} in stock</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function AdminProducts({ products, mode }: { products: Product[]; mode: "demo" | "admin" }) {
  const storedProducts = useLocal<Product[] | null>(PRODUCT_KEY, null);
  const items = mode === "demo" && storedProducts ? storedProducts : products;
  const [note, setNote] = useState("");

  async function changeStock(variantId: string, stock: number) {
    if (mode === "demo") {
      const next = items.map((product) => ({
        ...product,
        variants: product.variants.map((variant) =>
          variant.id === variantId ? { ...variant, stock } : variant,
        ),
      }));
      writeLocal(PRODUCT_KEY, next);
      setNote("Stock updated in this demo session.");
      return;
    }
    const result = await updateVariantStock(variantId, stock);
    setNote(result.error ?? "Stock saved.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageTitle eyebrow="Catalog" title="Products" />
        <Link href="/admin/products/new" className="h-10 rounded-full bg-ember-deep px-4 text-sm leading-10 text-white" title="Add a product">
          New product
        </Link>
      </div>
      {note ? <p className="mt-4 text-sm text-muted" role="status">{note}</p> : null}
      <div className="mt-6 overflow-x-auto rounded-3xl border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Piece</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Inventory</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">{product.name}</Link>
                  <p className="text-xs capitalize text-muted">{product.category}</p>
                </td>
                <td className="px-4 py-3">{formatPrice(product.priceCents)}</td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <label key={variant.id} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted">{variant.finish} · {variant.color}</span>
                        <input
                          type="number"
                          min={0}
                          defaultValue={variant.stock}
                          aria-label={`Stock for ${product.name}, ${variant.finish}`}
                          title={`Update stock for ${variant.finish}`}
                          className="h-9 w-20 rounded-lg border border-line bg-background px-2"
                          onBlur={(event) => changeStock(variant.id, Number(event.target.value))}
                        />
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminOrders({ orders, mode }: { orders: Order[]; mode: "demo" | "admin" }) {
  const router = useRouter();
  const stored = useLocal<Order[] | null>(ORDER_KEY, null);
  const items = mode === "demo" && stored ? stored : orders;
  const [note, setNote] = useState("");

  async function changeStatus(id: string, status: OrderStatus) {
    if (mode === "demo") {
      const next = items.map((order) => (order.id === id ? { ...order, status } : order));
      writeLocal(ORDER_KEY, next);
      setNote("Status updated in this demo session.");
      return;
    }
    const result = await updateOrderStatus(id, status);
    setNote(result.error ?? "Order updated.");
    if (!result.error) {
      router.refresh();
    }
  }

  return (
    <div>
      <PageTitle eyebrow="Fulfillment" title="Orders" />
      {note ? <p className="mt-4 text-sm text-muted" role="status">{note}</p> : null}
      <div className="mt-6 overflow-x-auto rounded-3xl border border-line">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <span className="font-medium">{order.id}</span>
                  <p className="text-xs text-muted">{order.createdAt.slice(0, 10)}</p>
                </td>
                <td className="px-4 py-3">
                  {order.name}
                  <p className="text-xs text-muted">{order.email}</p>
                </td>
                <td className="px-4 py-3">{formatPrice(order.totalCents)}</td>
                <td className="px-4 py-3">
                  <label className="sr-only" htmlFor={`status-${order.id}`}>Status for {order.id}</label>
                  <select
                    id={`status-${order.id}`}
                    value={order.status}
                    title={`Update status for ${order.id}`}
                    onChange={(event) => changeStatus(order.id, event.target.value as OrderStatus)}
                    className="h-10 rounded-full border border-line bg-background px-3 capitalize"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductEditor({
  product,
  mode,
  categories,
  catalog,
}: {
  product: Product | null;
  mode: "demo" | "admin";
  categories: Category[];
  catalog: Product[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const first = product?.variants[0];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = readInput(form, product?.id);
    if (!input) {
      setError("Name, slug, price, and one finish are required.");
      return;
    }
    setPending(true);
    if (mode === "demo") {
      const base = readLocal<Product[] | null>(PRODUCT_KEY, null) ?? catalog;
      const nextProduct = toProduct(input, product);
      const next = product
        ? base.map((item) => (item.id === product.id ? nextProduct : item))
        : [nextProduct, ...base];
      writeLocal(PRODUCT_KEY, next);
      setPending(false);
      router.push("/admin/products");
      return;
    }
    const result = await saveProduct(input);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function remove() {
    if (!product) return;
    if (!window.confirm(`Delete ${product.name}?`)) return;
    if (mode === "demo") {
      const base = readLocal<Product[] | null>(PRODUCT_KEY, null) ?? catalog;
      writeLocal(
        PRODUCT_KEY,
        base.filter((item) => item.id !== product.id),
      );
      router.push("/admin/products");
      return;
    }
    const result = await deleteProduct(product.id);
    if (result.error) setError(result.error);
    else router.push("/admin/products");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
      <PageTitle eyebrow="Catalog" title={product ? product.name : "New product"} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" defaultValue={product?.name ?? ""} />
        <Field label="Slug" name="slug" defaultValue={product?.slug ?? ""} />
      </div>
      <label className="block text-sm">
        Description
        <textarea name="description" required defaultValue={product?.description ?? ""} rows={4} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2" />
      </label>
      <label className="block text-sm">
        Details, one per line
        <textarea name="details" defaultValue={product?.details.join("\n") ?? ""} rows={4} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2" />
      </label>
      <label className="block text-sm">
        Category
        <select name="category" defaultValue={product?.category ?? "sofas"} className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3">
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>{category.name}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Image URL" name="imageUrl" defaultValue={product?.images[0]?.src ?? ""} />
        <Field label="Image alt text" name="imageAlt" defaultValue={product?.images[0]?.alt ?? ""} />
      </div>
      {mode === "admin" ? <ImageUpload /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Finish" name="finish" defaultValue={first?.finish ?? "Natural oak"} />
        <Field label="Material" name="material" defaultValue={first?.material ?? "Oak"} />
        <Field label="Color" name="color" defaultValue={first?.color ?? "Sand"} />
        <Field label="Color hex" name="colorHex" defaultValue={first?.colorHex ?? "#d8c7ae"} />
        <Field label="Price (USD)" name="price" defaultValue={first ? String(first.priceCents / 100) : ""} />
        <Field label="Stock" name="stock" defaultValue={first ? String(first.stock) : "0"} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="bestseller" defaultChecked={product?.bestseller} /> Best seller
      </label>
      {error ? <p className="text-sm text-warn" role="alert">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button disabled={pending} className="h-11 rounded-full bg-ember-deep px-5 text-sm text-white disabled:opacity-60">
          {pending ? "Saving…" : "Save product"}
        </button>
        {product ? (
          <button type="button" onClick={remove} title="Delete product" className="h-11 rounded-full border border-line px-5 text-sm">
            Delete
          </button>
        ) : null}
      </div>
      <p className="text-xs text-muted">
        {mode === "demo"
          ? "Demo edits stay in this browser. The public catalog is unchanged."
          : "Saving writes through Supabase. Row level security allows this only for admins."}
      </p>
    </form>
  );
}

function ImageUpload() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      setError(data.error || "Upload failed.");
      return;
    }
    setUrl(data.url);
    const input = document.querySelector<HTMLInputElement>('input[name="imageUrl"]');
    if (input) input.value = data.url;
  }

  return (
    <label className="block text-sm">
      Upload to Supabase Storage
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        title="Upload a product image"
        className="mt-1 block w-full text-sm"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      {url ? <span className="mt-1 block text-xs text-good">Uploaded. The image URL field was filled in.</span> : null}
      {error ? <span className="mt-1 block text-xs text-warn">{error}</span> : null}
    </label>
  );
}

function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl">{title}</h1>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </div>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input name={name} defaultValue={defaultValue} className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3" />
    </label>
  );
}

function readInput(form: FormData, id?: string): ProductInput | null {
  const name = String(form.get("name") || "").trim();
  const slug = String(form.get("slug") || "").trim();
  const price = Number(form.get("price"));
  const finish = String(form.get("finish") || "").trim();
  const category = String(form.get("category") || "sofas");
  if (!name || !slug || !finish || !Number.isFinite(price) || !CATEGORY_SLUGS.includes(category as Product["category"])) {
    return null;
  }
  return {
    id,
    name,
    slug,
    description: String(form.get("description") || ""),
    category: category as Product["category"],
    details: String(form.get("details") || "").split("\n").map((line) => line.trim()).filter(Boolean),
    featured: form.get("featured") === "on",
    bestseller: form.get("bestseller") === "on",
    imageUrl: String(form.get("imageUrl") || ""),
    imageAlt: String(form.get("imageAlt") || name),
    variants: [{
      finish,
      material: String(form.get("material") || "Oak"),
      color: String(form.get("color") || "Sand"),
      colorHex: String(form.get("colorHex") || "#d8c7ae"),
      price,
      stock: Number(form.get("stock") || 0),
    }],
  };
}

function toProduct(input: ProductInput, existing: Product | null): Product {
  const priceCents = Math.round(input.variants[0].price * 100);
  const variant = existing?.variants[0];
  return {
    id: existing?.id ?? crypto.randomUUID(),
    slug: input.slug,
    name: input.name,
    category: input.category,
    description: input.description,
    details: input.details,
    priceCents,
    featured: input.featured,
    bestseller: input.bestseller,
    createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
    images: input.imageUrl
      ? [{ id: existing?.images[0]?.id ?? crypto.randomUUID(), src: input.imageUrl, alt: input.imageAlt, credit: input.imageUrl }]
      : existing?.images ?? [],
    variants: [{
      id: variant?.id ?? crypto.randomUUID(),
      sku: variant?.sku ?? input.slug.toUpperCase(),
      finish: input.variants[0].finish,
      material: input.variants[0].material,
      color: input.variants[0].color,
      colorHex: input.variants[0].colorHex,
      priceCents,
      stock: input.variants[0].stock,
    }],
    reviews: existing?.reviews ?? [],
  };
}


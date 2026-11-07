import { queryCatalog, relatedProducts } from "@/lib/catalog-query";
import { categories, products as localProducts } from "@/lib/data/catalog";
import { sampleOrders } from "@/lib/data/orders";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CatalogQuery, Category, Order, OrderStatus, Product, Review } from "@/lib/types";

// Reads go through the public.oak_* views. Those views are
// security_invoker, so RLS on the oak tables still applies and the
// anon key is enough for the catalog. Any failure, including a
// project that isn't configured, falls back to the seed in lib/data
// so the shop still renders.
const PRODUCT_SELECT = `
  id, slug, name, description, details, price_cents, featured, bestseller, created_at, keywords,
  category:oak_categories!inner(slug, name),
  images:oak_product_images(id, url, alt, credit, sort_order),
  variants:oak_product_variants(id, sku, finish, material, color, color_hex, price_cents, stock),
  reviews:oak_reviews(id, author_name, rating, title, body, created_at)
`;

export async function listProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return localProducts;
  try {
    const supabase = await createServerSupabase();
    if (!supabase) return localProducts;
    const { data, error } = await supabase
      .from("oak_products")
      .select(PRODUCT_SELECT)
      .order("name");
    if (error || !data) return localProducts;
    return data.map(mapProduct);
  } catch {
    return localProducts;
  }
}

export async function listCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return categories;
  try {
    const supabase = await createServerSupabase();
    if (!supabase) return categories;
    const { data, error } = await supabase.from("oak_categories").select("id, slug, name, description, image").order("name");
    if (error || !data) return categories;
    return data as Category[];
  } catch {
    return categories;
  }
}

// Text search is the query I push to Postgres, against the generated
// fts column. Filters and sorts with no search term load the catalog
// and run through queryCatalog. One filter implementation, and the
// catalog is small enough that the extra rows don't matter.
export async function getCatalog(query: CatalogQuery) {
  if (!isSupabaseConfigured() || !query.q) {
    const all = await listProducts();
    return { ...queryCatalog(all, query), source: isSupabaseConfigured() ? "supabase" as const : "local" as const };
  }

  try {
    const supabase = await createServerSupabase();
    if (!supabase) {
      return { ...queryCatalog(localProducts, query), source: "local" as const };
    }
    let request = supabase
      .from("oak_products")
      .select(filteredSelect(query), { count: "exact" })
      .textSearch("fts", query.q, { type: "websearch", config: "english" });

    if (query.category) request = request.eq("category.slug", query.category);
    if (query.material) request = request.eq("variants.material", query.material);
    if (query.color) request = request.eq("variants.color", query.color);
    if (query.min != null) request = request.gte("price_cents", query.min * 100);
    if (query.max != null) request = request.lte("price_cents", query.max * 100);

    if (query.sort === "price-asc") request = request.order("price_cents", { ascending: true });
    else if (query.sort === "price-desc") request = request.order("price_cents", { ascending: false });
    else if (query.sort === "newest") request = request.order("created_at", { ascending: false });
    else request = request.order("featured", { ascending: false }).order("name");

    const from = (query.page - 1) * query.pageSize;
    const to = from + query.pageSize - 1;
    const { data, error, count } = await request.range(from, to);
    if (error || !data) {
      return { ...queryCatalog(localProducts, query), source: "local" as const };
    }
    const items = (data as unknown as ProductRow[]).map(mapProduct);
    const total = count ?? items.length;
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    return {
      items,
      page: query.page,
      pageCount,
      total,
      source: "supabase" as const,
    };
  } catch {
    return { ...queryCatalog(localProducts, query), source: "local" as const };
  }
}

// !inner on variants when a material or color is set. A normal embed
// would still return the product with an empty variant list. Inner
// drops products that have no matching finish.
function filteredSelect(query: CatalogQuery) {
  const variants = query.material || query.color
    ? "variants:oak_product_variants!inner(id, sku, finish, material, color, color_hex, price_cents, stock)"
    : "variants:oak_product_variants(id, sku, finish, material, color, color_hex, price_cents, stock)";
  return `
    id, slug, name, description, details, price_cents, featured, bestseller, created_at, keywords,
    category:oak_categories!inner(slug, name),
    images:oak_product_images(id, url, alt, credit, sort_order),
    ${variants},
    reviews:oak_reviews(id, author_name, rating, title, body, created_at)
  `;
}

export async function getProduct(slug: string) {
  const all = await listProducts();
  return all.find((product) => product.slug === slug) ?? null;
}

export async function getRelated(product: Product) {
  const all = await listProducts();
  return relatedProducts(all, product);
}

// The admin session, not the service role. RLS already limits this
// select to role = 'admin'. On failure I show the sample orders so
// the studio still has something to walk through.
export async function listOrdersForAdmin(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return sampleOrders;
  try {
    const supabase = await createServerSupabase();
    if (!supabase) return sampleOrders;
    const { data, error } = await supabase
      .from("oak_orders")
      .select("public_id, email, shipping_name, shipping_address, status, subtotal_cents, shipping_cents, total_cents, created_at, order_items:oak_order_items(id, variant_id, product_name, variant_label, unit_price_cents, quantity)")
      .order("created_at", { ascending: false });
    if (error || !data) return sampleOrders;
    return data.map(mapOrder);
  } catch {
    return sampleOrders;
  }
}

// userId comes from getSessionUser(), and the policy is "own orders
// or admin". The eq() is the app-level filter; RLS is what stops a
// tampered client from reading someone else's rows. No fallback to
// sample orders here — an account page should not show fake purchases.
export async function listOrdersForUser(userId: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("oak_orders")
    .select("public_id, email, shipping_name, shipping_address, status, subtotal_cents, shipping_cents, total_cents, created_at, order_items:oak_order_items(id, variant_id, product_name, variant_label, unit_price_cents, quantity)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapOrder);
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[] | null;
  price_cents: number;
  featured: boolean;
  bestseller: boolean;
  created_at: string;
  category: { slug: Product["category"]; name: string } | { slug: Product["category"]; name: string }[] | null;
  images: { id: string; url: string; alt: string; credit: string | null; sort_order: number }[] | null;
  variants: {
    id: string;
    sku: string;
    finish: string;
    material: string;
    color: string;
    color_hex: string;
    price_cents: number;
    stock: number;
  }[] | null;
  reviews: {
    id: string;
    author_name: string;
    rating: number;
    title: string | null;
    body: string;
    created_at: string;
  }[] | null;
}

function mapProduct(row: ProductRow): Product {
  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  const images = [...(row.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const reviews: Review[] = (row.reviews ?? []).map((review) => ({
    id: review.id,
    author: review.author_name,
    rating: review.rating,
    title: review.title ?? "",
    body: review.body,
    createdAt: review.created_at.slice(0, 10),
  }));
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: category?.slug ?? "sofas",
    description: row.description,
    details: row.details ?? [],
    priceCents: row.price_cents,
    featured: row.featured,
    bestseller: row.bestseller,
    createdAt: row.created_at.slice(0, 10),
    images: images.map((image) => ({
      id: image.id,
      src: image.url,
      alt: image.alt,
      credit: image.credit ?? "",
    })),
    variants: (row.variants ?? []).map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      finish: variant.finish,
      material: variant.material,
      color: variant.color,
      colorHex: variant.color_hex,
      priceCents: variant.price_cents,
      stock: variant.stock,
    })),
    reviews,
  };
}

interface OrderRow {
  public_id: string;
  email: string;
  shipping_name: string | null;
  shipping_address: string | null;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  created_at: string;
  order_items: {
    id: string;
    variant_id: string | null;
    product_name: string;
    variant_label: string;
    unit_price_cents: number;
    quantity: number;
  }[] | null;
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.public_id,
    email: row.email,
    name: row.shipping_name ?? "",
    address: row.shipping_address ?? "",
    status: row.status,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      variantId: item.variant_id ?? "",
      productName: item.product_name,
      variantLabel: item.variant_label,
      unitPriceCents: item.unit_price_cents,
      quantity: item.quantity,
    })),
  };
}

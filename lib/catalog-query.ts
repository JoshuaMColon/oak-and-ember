import type { CatalogQuery, Product, SortKey } from "@/lib/types";

const SORTS: SortKey[] = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "rating",
];

export const PAGE_SIZE = 12;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeQuery(
  input: Record<string, string | string[] | undefined>,
  defaults?: Partial<CatalogQuery>,
): CatalogQuery {
  const rawSort = one(input.sort);
  const sort = SORTS.find((item) => item === rawSort) ?? defaults?.sort ?? "featured";
  const min = numberOrUndefined(one(input.min));
  const max = numberOrUndefined(one(input.max));
  const page = numberOrUndefined(one(input.page));
  return {
    q: one(input.q)?.trim() || undefined,
    category: one(input.category) || defaults?.category,
    material: one(input.material) || undefined,
    color: one(input.color) || undefined,
    min,
    max,
    sort,
    page: Math.max(1, page ?? 1),
    pageSize: defaults?.pageSize ?? PAGE_SIZE,
  };
}

function numberOrUndefined(value: string | undefined) {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function averageRating(product: Product) {
  if (product.reviews.length === 0) return 0;
  const total = product.reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / product.reviews.length;
}

function haystack(product: Product) {
  return [
    product.name,
    product.description,
    product.details.join(" "),
    product.category,
    ...product.variants.flatMap((variant) => [
      variant.finish,
      variant.material,
      variant.color,
      variant.sku,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterProducts(products: Product[], query: CatalogQuery) {
  const tokens = (query.q ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return products.filter((product) => {
    if (query.category && product.category !== query.category) return false;
    if (
      query.material &&
      !product.variants.some(
        (variant) => variant.material.toLowerCase() === query.material!.toLowerCase(),
      )
    ) {
      return false;
    }
    if (
      query.color &&
      !product.variants.some(
        (variant) => variant.color.toLowerCase() === query.color!.toLowerCase(),
      )
    ) {
      return false;
    }
    const dollars = product.priceCents / 100;
    if (query.min != null && dollars < query.min) return false;
    if (query.max != null && dollars > query.max) return false;
    if (tokens.length > 0) {
      const text = haystack(product);
      if (!tokens.every((token) => text.includes(token))) return false;
    }
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortKey) {
  const copy = [...products];
  copy.sort((a, b) => {
    if (sort === "price-asc") return a.priceCents - b.priceCents || a.name.localeCompare(b.name);
    if (sort === "price-desc") return b.priceCents - a.priceCents || a.name.localeCompare(b.name);
    if (sort === "newest") return b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name);
    if (sort === "rating") {
      return averageRating(b) - averageRating(a) || a.name.localeCompare(b.name);
    }
    const score = (product: Product) => Number(product.featured) * 2 + Number(product.bestseller);
    return score(b) - score(a) || a.name.localeCompare(b.name);
  });
  return copy;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageCount,
    total: items.length,
  };
}

export function queryCatalog(products: Product[], query: CatalogQuery) {
  const filtered = filterProducts(products, query);
  const sorted = sortProducts(filtered, query.sort);
  return paginate(sorted, query.page, query.pageSize);
}

export function catalogHref(
  pathname: string,
  current: CatalogQuery,
  patch: Partial<CatalogQuery>,
) {
  const next: CatalogQuery = { ...current, ...patch };
  if (!Object.prototype.hasOwnProperty.call(patch, "page")) next.page = 1;
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.material) params.set("material", next.material);
  if (next.color) params.set("color", next.color);
  if (next.min != null) params.set("min", String(next.min));
  if (next.max != null) params.set("max", String(next.max));
  if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function facetValues(products: Product[]) {
  const materials = new Set<string>();
  const colors = new Set<string>();
  let min = Infinity;
  let max = 0;
  for (const product of products) {
    min = Math.min(min, product.priceCents);
    max = Math.max(max, ...product.variants.map((variant) => variant.priceCents));
    for (const variant of product.variants) {
      materials.add(variant.material);
      colors.add(variant.color);
    }
  }
  return {
    materials: [...materials].sort((a, b) => a.localeCompare(b)),
    colors: [...colors].sort((a, b) => a.localeCompare(b)),
    minDollars: Math.floor(min / 100),
    maxDollars: Math.ceil(max / 100),
  };
}

export function relatedProducts(products: Product[], product: Product, limit = 4) {
  return products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, limit);
}

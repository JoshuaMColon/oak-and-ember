export const CATEGORY_SLUGS = [
  "sofas",
  "chairs",
  "tables",
  "beds",
  "storage",
  "lighting",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
}

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  credit: string;
}

export interface Variant {
  id: string;
  sku: string;
  finish: string;
  material: string;
  color: string;
  colorHex: string;
  priceCents: number;
  stock: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  description: string;
  details: string[];
  priceCents: number;
  featured: boolean;
  bestseller: boolean;
  createdAt: string;
  images: ProductImage[];
  variants: Variant[];
  reviews: Review[];
}

export interface OrderItem {
  id: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  unitPriceCents: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  email: string;
  name: string;
  address: string;
  status: OrderStatus;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
}

export interface CartLine {
  variantId: string;
  quantity: number;
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export interface CatalogQuery {
  q?: string;
  category?: string;
  material?: string;
  color?: string;
  min?: number;
  max?: number;
  sort: SortKey;
  page: number;
  pageSize: number;
}

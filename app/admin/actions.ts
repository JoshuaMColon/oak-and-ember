"use server";

import { revalidatePath } from "next/cache";
import { getAccess } from "@/lib/access";
import { dollarsToCents } from "@/lib/money";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CategorySlug, OrderStatus } from "@/lib/types";

export interface VariantInput {
  id?: string;
  finish: string;
  material: string;
  color: string;
  colorHex: string;
  price: number;
  stock: number;
}

export interface ProductInput {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: CategorySlug;
  details: string[];
  featured: boolean;
  bestseller: boolean;
  imageUrl: string;
  imageAlt: string;
  variants: VariantInput[];
}

async function adminClient() {
  const access = await getAccess();
  if (access !== "admin") return { error: "Only an admin can change the catalog." as const, supabase: null };
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "Supabase is not configured." as const, supabase: null };
  return { error: null, supabase };
}

export async function saveProduct(input: ProductInput) {
  const gate = await adminClient();
  if (!gate.supabase) return { error: gate.error };
  const supabase = gate.supabase;
  const { data: category } = await supabase.from("oak_categories").select("id").eq("slug", input.category).maybeSingle();
  if (!category) return { error: "Unknown category." };
  const priceCents = Math.min(...input.variants.map((variant) => dollarsToCents(variant.price)));
  const keywords = [
    input.category,
    ...input.variants.flatMap((variant) => [variant.finish, variant.material, variant.color]),
  ].join(" ");

  const payload = {
    slug: input.slug,
    name: input.name,
    description: input.description,
    details: input.details,
    price_cents: priceCents,
    featured: input.featured,
    bestseller: input.bestseller,
    keywords,
    category_id: category.id,
  };

  const productId = input.id
    ? input.id
    : (await supabase.from("oak_products").insert(payload).select("id").single()).data?.id;

  if (input.id) {
    const { error } = await supabase.from("oak_products").update(payload).eq("id", input.id);
    if (error) return { error: error.message };
  }
  if (!productId) return { error: "Could not save the product." };

  if (input.imageUrl) {
    await supabase.from("oak_product_images").delete().eq("product_id", productId);
    await supabase.from("oak_product_images").insert({
      product_id: productId,
      url: input.imageUrl,
      alt: input.imageAlt || input.name,
      credit: input.imageUrl,
      sort_order: 0,
    });
  }

  await supabase.from("oak_product_variants").delete().eq("product_id", productId);
  const { error: variantError } = await supabase.from("oak_product_variants").insert(
    input.variants.map((variant, index) => ({
      product_id: productId,
      sku: `${input.slug}-${index + 1}`.toUpperCase(),
      finish: variant.finish,
      material: variant.material,
      color: variant.color,
      color_hex: variant.colorHex,
      price_cents: dollarsToCents(variant.price),
      stock: variant.stock,
    })),
  );
  if (variantError) return { error: variantError.message };

  revalidatePath("/admin");
  revalidatePath("/catalog");
  return { error: null, id: productId };
}

export async function deleteProduct(id: string) {
  const gate = await adminClient();
  if (!gate.supabase) return { error: gate.error };
  const { error } = await gate.supabase.from("oak_products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { error: null };
}

export async function updateVariantStock(variantId: string, stock: number) {
  const gate = await adminClient();
  if (!gate.supabase) return { error: gate.error };
  const { error } = await gate.supabase
    .from("oak_product_variants")
    .update({ stock: Math.max(0, Math.floor(stock)) })
    .eq("id", variantId);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { error: null };
}

export async function updateOrderStatus(publicId: string, status: OrderStatus) {
  const gate = await adminClient();
  if (!gate.supabase) return { error: gate.error };
  const { error } = await gate.supabase.from("oak_orders").update({ status }).eq("public_id", publicId);
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  return { error: null };
}

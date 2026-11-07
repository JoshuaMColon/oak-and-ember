import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/access";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CartLine } from "@/lib/types";

// Cart sync for a signed-in browser. The user id is taken from the
// session, never from the body, so one account can't write another's
// cart. A signed-out caller gets an empty payload and the client
// stays on localStorage.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ userId: null, cart: null, wishlist: null });
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ userId: null, cart: null, wishlist: null });

  const { data: cart } = await supabase.from("oak_carts").select("id, cart_items:oak_cart_items(variant_id, quantity)").eq("user_id", user.id).maybeSingle();
  const { data: wishes } = await supabase.from("oak_wishlists").select("product_id").eq("user_id", user.id);
  const lines: CartLine[] = (cart?.cart_items ?? []).map((item: { variant_id: string; quantity: number }) => ({
    variantId: item.variant_id,
    quantity: item.quantity,
  }));
  return NextResponse.json({
    userId: user.id,
    cart: lines,
    wishlist: (wishes ?? []).map((wish: { product_id: string }) => wish.product_id),
  });
}

// Replace, don't diff. The browser just merged and is the source of
// truth for this save. Delete-then-insert keeps a removed line from
// lingering because I forgot a case in an upsert.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ mode: "local" });
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ mode: "local" });

  const body = (await request.json().catch(() => null)) as {
    cart?: CartLine[];
    wishlist?: string[];
  } | null;
  if (!body) return NextResponse.json({ error: "Invalid sync." }, { status: 400 });

  const { data: existing } = await supabase.from("oak_carts").select("id").eq("user_id", user.id).maybeSingle();
  const cartId = existing?.id
    ?? (await supabase.from("oak_carts").insert({ user_id: user.id }).select("id").single()).data?.id;
  if (cartId) {
    await supabase.from("oak_cart_items").delete().eq("cart_id", cartId);
    const lines = (body.cart ?? []).filter((line) => line.variantId && line.quantity > 0);
    if (lines.length) {
      await supabase.from("oak_cart_items").insert(
        lines.map((line) => ({ cart_id: cartId, variant_id: line.variantId, quantity: line.quantity })),
      );
    }
  }

  await supabase.from("oak_wishlists").delete().eq("user_id", user.id);
  const wishes = [...new Set(body.wishlist ?? [])];
  if (wishes.length) {
    await supabase.from("oak_wishlists").insert(wishes.map((productId) => ({ user_id: user.id, product_id: productId })));
  }

  return NextResponse.json({ mode: "saved" });
}

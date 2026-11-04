"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { readLocal, useLocal, useMounted, writeLocal } from "@/lib/browser-store";
import { clampQuantity, mergeCartLines, mergeWishlists } from "@/lib/cart";
import type { CartLine, Product } from "@/lib/types";

const CART_KEY = "oak-ember-cart";
const WISH_KEY = "oak-ember-wishlist";
const SYNC_KEY = "oak-ember-synced-user";

interface ShopContextValue {
  ready: boolean;
  lines: CartLine[];
  wishlist: string[];
  count: number;
  message: string;
  add: (variantId: string, quantity?: number, stock?: number) => void;
  setQuantity: (variantId: string, quantity: number, stock?: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  toggleWish: (productId: string) => void;
  wished: (productId: string) => boolean;
}

const ShopContext = createContext<ShopContextValue | null>(null);
const emptyLines: CartLine[] = [];
const emptyWish: string[] = [];

export function ShopProvider({ children }: { children: ReactNode }) {
  const lines = useLocal<CartLine[]>(CART_KEY, emptyLines);
  const wishlist = useLocal<string[]>(WISH_KEY, emptyWish);
  const ready = useMounted();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/sync");
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as {
          userId: string | null;
          cart: CartLine[] | null;
          wishlist: string[] | null;
        };
        if (!data.userId || cancelled) return;
        const synced = localStorage.getItem(SYNC_KEY);
        const guestCart = readLocal<CartLine[]>(CART_KEY, emptyLines);
        const guestWish = readLocal<string[]>(WISH_KEY, emptyWish);
        const nextCart = synced === data.userId ? (data.cart ?? []) : mergeCartLines(guestCart, data.cart ?? []);
        const nextWish = synced === data.userId ? (data.wishlist ?? []) : mergeWishlists(guestWish, data.wishlist ?? []);
        if (synced !== data.userId) {
          await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart: nextCart, wishlist: nextWish }),
          });
          localStorage.setItem(SYNC_KEY, data.userId);
        }
        if (!cancelled) {
          writeLocal(CART_KEY, nextCart);
          writeLocal(WISH_KEY, nextWish);
        }
      } catch {
        // Guest cart remains in localStorage when the network or Supabase is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ShopContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    return {
      ready,
      lines,
      wishlist,
      count,
      message: "",
      add(variantId, quantity = 1, stock = 12) {
        const current = readLocal<CartLine[]>(CART_KEY, emptyLines);
        const existing = current.find((line) => line.variantId === variantId);
        const nextQty = clampQuantity((existing?.quantity ?? 0) + quantity, stock);
        if (nextQty <= 0) return;
        const without = current.filter((line) => line.variantId !== variantId);
        writeLocal(CART_KEY, [...without, { variantId, quantity: nextQty }]);
      },
      setQuantity(variantId, quantity, stock = 12) {
        const current = readLocal<CartLine[]>(CART_KEY, emptyLines);
        if (quantity <= 0) {
          writeLocal(CART_KEY, current.filter((line) => line.variantId !== variantId));
          return;
        }
        writeLocal(
          CART_KEY,
          current.map((line) =>
            line.variantId === variantId ? { ...line, quantity: clampQuantity(quantity, stock) } : line,
          ),
        );
      },
      remove(variantId) {
        const current = readLocal<CartLine[]>(CART_KEY, emptyLines);
        writeLocal(CART_KEY, current.filter((line) => line.variantId !== variantId));
      },
      clear() {
        writeLocal(CART_KEY, emptyLines);
      },
      toggleWish(productId) {
        const current = readLocal<string[]>(WISH_KEY, emptyWish);
        writeLocal(
          WISH_KEY,
          current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
        );
      },
      wished(productId) {
        return wishlist.includes(productId);
      },
    };
  }, [lines, wishlist, ready]);

  return (
    <ShopContext.Provider value={value}>
      {children}
      <p className="sr-only" aria-live="polite">
        {lines.length ? `${countLabel(lines)} in the cart` : ""}
      </p>
    </ShopContext.Provider>
  );
}

function countLabel(lines: CartLine[]) {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used within ShopProvider");
  return value;
}

export function findVariant(products: Product[], variantId: string) {
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

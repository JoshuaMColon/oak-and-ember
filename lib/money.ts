// Free shipping at $1,500, otherwise $75. The cart summary and
// resolveLines both call shippingCents, so the number on the page is
// the number Checkout will charge.
export const FREE_SHIPPING_CENTS = 150_000;
export const FLAT_SHIPPING_CENTS = 7_500;

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function shippingCents(subtotalCents: number) {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_SHIPPING_CENTS ? 0 : FLAT_SHIPPING_CENTS;
}

export function dollarsToCents(dollars: number) {
  return Math.round(dollars * 100);
}

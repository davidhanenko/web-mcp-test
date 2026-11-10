// Checkout-only promo. Catalog prices and getCart() stay on list price.
export const PROMO_CODE = "RIDGE30";
export const PROMO_PRODUCT_ID = "ember-down-jacket";
export const PROMO_AMOUNT = 30;

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

export function promoDiscount(
  items: { productId: string; quantity: number }[],
  code: string,
): number {
  if (normalizePromoCode(code) !== PROMO_CODE) return 0;
  const units = items
    .filter((item) => item.productId === PROMO_PRODUCT_ID)
    .reduce((sum, item) => sum + item.quantity, 0);
  return units * PROMO_AMOUNT;
}

export function payTotal(listTotal: number, discount: number): number {
  return Math.max(0, listTotal - discount);
}

import { getProduct } from "@/lib/catalog";

// Checkout-only promo. Catalog prices and getCart() stay on list price.
export const PROMO_CODE = "RIDGE30";
export const PROMO_PRODUCT_ID = "ember-down-jacket";
export const PROMO_AMOUNT = 30;

export type Offer = {
  code: string;
  productId: string;
  productName: string;
  listPrice: number;
  amountOff: number;
  priceWithCode: number;
  appliesAt: "checkout";
};

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

/** The running offers, as the header strip and the sale popup show them. */
export function getOffers(): Offer[] {
  const product = getProduct(PROMO_PRODUCT_ID);
  if (!product) return [];
  return [
    {
      code: PROMO_CODE,
      productId: product.id,
      productName: product.name,
      listPrice: product.price,
      amountOff: PROMO_AMOUNT,
      priceWithCode: payTotal(product.price, PROMO_AMOUNT),
      appliesAt: "checkout",
    },
  ];
}

/** The offer for one product, if there is one. */
export function getOfferFor(productId: string): Offer | undefined {
  return getOffers().find((offer) => offer.productId === productId);
}

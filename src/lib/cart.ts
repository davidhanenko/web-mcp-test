import { getProduct } from "@/lib/catalog";
import type { CartDetails, CartItem, Size } from "@/lib/types";
import { SIZES } from "@/lib/types";

/** Cart business rules. Plain functions with no React or store code, so they run anywhere. */

function isSize(value: string): value is Size {
  return (SIZES as readonly string[]).includes(value);
}

/** Throws unless `quantity` is a whole number ≥ 1 (or ≥ 0 when `allowZero`). */
export function assertValidQuantity(
  quantity: number,
  { allowZero = false } = {},
): void {
  if (!Number.isInteger(quantity) || quantity < (allowZero ? 0 : 1)) {
    throw new Error("Quantity must be a positive whole number.");
  }
}

export function assertProductExists(productId: string): void {
  if (!getProduct(productId)) {
    throw new Error(`Unknown product: ${productId}`);
  }
}

/**
 * Throws unless the shopper can have `quantity` units of the product in `size`:
 * the product exists, comes in that size, and has that many in stock.
 */
export function assertAvailable(
  productId: string,
  size: string,
  quantity: number,
): asserts size is Size {
  const product = getProduct(productId);
  if (!product) {
    throw new Error(`Unknown product: ${productId}`);
  }

  if (!isSize(size) || !product.sizes.includes(size)) {
    throw new Error(`Invalid size ${size} for ${product.name}.`);
  }

  const inStock = product.stock[size] ?? 0;
  if (inStock <= 0) {
    throw new Error(`${product.name} in size ${size} is out of stock.`);
  }

  if (quantity > inStock) {
    throw new Error(`Only ${inStock} left in size ${size} for ${product.name}.`);
  }
}

export function findCartItem(
  items: CartItem[],
  productId: string,
  size: string,
): CartItem | undefined {
  return items.find(
    (item) => item.productId === productId && item.size === size,
  );
}

/** Number of units across all items, e.g. 2 jackets + 1 socks = 3. */
export function getTotalQuantity(
  items: readonly Pick<CartItem, "quantity">[],
): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Joins the stored cart items with the catalog to get names, images, prices,
 * subtotals and the cart total. Prices always come from the catalog, never from storage.
 */
export function getCartDetails(items: CartItem[]): CartDetails {
  const detailedItems = items.map((item) => {
    const product = getProduct(item.productId);
    const unitPrice = product?.price ?? 0;
    return {
      ...item,
      name: product?.name ?? item.productId,
      image: product?.image ?? "",
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });

  return {
    items: detailedItems,
    total: detailedItems.reduce((sum, item) => sum + item.subtotal, 0),
    totalQuantity: getTotalQuantity(items),
  };
}

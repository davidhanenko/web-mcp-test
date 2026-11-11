import { getColor, getProduct, getStock } from "@/lib/catalog";
import type { CartDetails, CartItem, Size } from "@/lib/types";
import { SHOE_SIZES, SIZES } from "@/lib/types";

// Cart business rules. Plain functions with no React or store code, so they run anywhere.

function isSize(value: string): value is Size {
  return (
    (SIZES as readonly string[]).includes(value) ||
    (SHOE_SIZES as readonly string[]).includes(value)
  );
}

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

// The product exists, has that size and color, and has that many in stock.
export function assertAvailable(
  productId: string,
  size: string,
  color: string,
  quantity: number,
): asserts size is Size {
  const product = getProduct(productId);
  if (!product) {
    throw new Error(`Unknown product: ${productId}`);
  }

  if (!isSize(size) || !product.sizes.includes(size)) {
    throw new Error(`Invalid size ${size} for ${product.name}.`);
  }

  const productColor = getColor(product, color);
  if (!productColor) {
    throw new Error(`Invalid color ${color} for ${product.name}.`);
  }

  const inStock = getStock(product, color, size);
  if (inStock <= 0) {
    throw new Error(
      `${product.name} in ${productColor.name}, size ${size} is out of stock.`,
    );
  }

  if (quantity > inStock) {
    throw new Error(
      `Only ${inStock} left in ${productColor.name}, size ${size} for ${product.name}.`,
    );
  }
}

export function findCartItem(
  items: CartItem[],
  productId: string,
  size: string,
  color: string,
): CartItem | undefined {
  return items.find(
    (item) =>
      item.productId === productId &&
      item.size === size &&
      item.color === color,
  );
}

export function getTotalQuantity(
  items: readonly Pick<CartItem, "quantity">[],
): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// Prices always come from the catalog, never from storage.
export function getCartDetails(items: CartItem[]): CartDetails {
  const detailedItems = items.map((item) => {
    const product = getProduct(item.productId);
    const productColor = product && getColor(product, item.color);
    const unitPrice = product?.price ?? 0;
    return {
      ...item,
      name: product?.name ?? item.productId,
      image: product?.image ?? "",
      colorName: productColor?.name ?? item.color,
      colorHex: productColor?.hex ?? "#9AA0A6",
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

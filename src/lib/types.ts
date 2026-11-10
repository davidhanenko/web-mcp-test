export const CATEGORIES = ["jackets", "boots", "socks", "shirts"] as const;
export type Category = (typeof CATEGORIES)[number];

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type ApparelSize = (typeof SIZES)[number];

export const SHOE_SIZES = ["8", "9", "10", "11", "12"] as const;
export type ShoeSize = (typeof SHOE_SIZES)[number];

// Apparel letters or boot numbers. The tool schema still lists only SIZES.
export type Size = ApparelSize | ShoeSize;

/** One color a product comes in, with its own stock per size. */
export type ProductColor = {
  id: string;
  name: string;
  /** CSS color used for the swatch. */
  hex: string;
  stock: Partial<Record<Size, number>>;
};

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  sizes: Size[];
  colors: ProductColor[];
  tags: string[];
  description: string;
  image: string;
};

export type SearchFilters = {
  query?: string;
  category?: Category;
  maxPrice?: number;
  size?: Size;
  inStockOnly?: boolean;
};

/** What the cart stores (and persists): which product, in which size and color, how many. */
export type CartItem = {
  productId: string;
  size: Size;
  /** `ProductColor.id` */
  color: string;
  quantity: number;
};

/** A cart item joined with its product's current catalog data. */
export type CartItemDetails = CartItem & {
  name: string;
  image: string;
  colorName: string;
  colorHex: string;
  unitPrice: number;
  /** unitPrice × quantity */
  subtotal: number;
};

/** The whole cart as shown to the shopper (and returned by `getCart()`). */
export type CartDetails = {
  items: CartItemDetails[];
  /** Price of everything in the cart. Named by the spec: `getCart(): { items, total }`. */
  total: number;
  /** Number of units across all items (what the cart badge shows). */
  totalQuantity: number;
};

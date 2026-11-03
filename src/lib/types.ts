export const CATEGORIES = ["jackets", "boots", "socks", "shirts"] as const;
export type Category = (typeof CATEGORIES)[number];

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  sizes: Size[];
  stock: Partial<Record<Size, number>>;
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

/** What the cart stores (and persists): which product, in which size, how many. */
export type CartItem = {
  productId: string;
  size: Size;
  quantity: number;
};

/** A cart item joined with its product's current catalog data. */
export type CartItemDetails = CartItem & {
  name: string;
  image: string;
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

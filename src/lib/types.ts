export const CATEGORIES = ["jackets", "boots", "socks", "shirts"] as const;
export type Category = (typeof CATEGORIES)[number];

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type ApparelSize = (typeof SIZES)[number];

export const SHOE_SIZES = ["8", "9", "10", "11", "12"] as const;
export type ShoeSize = (typeof SHOE_SIZES)[number];

// Apparel letters or boot numbers.
export type Size = ApparelSize | ShoeSize;

export const ALL_SIZES: readonly Size[] = [...SIZES, ...SHOE_SIZES];

export type ProductColor = {
  id: string;
  name: string;
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

export type CartItem = {
  productId: string;
  size: Size;
  // ProductColor.id
  color: string;
  quantity: number;
};

export type CartItemDetails = CartItem & {
  name: string;
  image: string;
  colorName: string;
  colorHex: string;
  unitPrice: number;
  // unitPrice × quantity
  subtotal: number;
};

export type CartDetails = {
  items: CartItemDetails[];
  // Named by the spec: getCart(): { items, total }.
  total: number;
  // What the cart badge shows.
  totalQuantity: number;
};

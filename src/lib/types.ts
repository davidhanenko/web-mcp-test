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

export type CartLine = {
  id: string;
  size: Size;
  qty: number;
};

export type CartViewItem = CartLine & {
  name: string;
  price: number;
  image: string;
  lineTotal: number;
};

export type CartView = {
  items: CartViewItem[];
  total: number;
};

import productsData from "@/data/products.json";
import type {
  Category,
  Product,
  ProductColor,
  SearchFilters,
  Size,
} from "@/lib/types";

const products = productsData as Product[];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getAllProducts(): Product[] {
  return products;
}

export function getColor(
  product: Product,
  colorId: string,
): ProductColor | undefined {
  return product.colors.find((color) => color.id === colorId);
}

// 0 for an unknown color.
export function getStock(
  product: Product,
  colorId: string,
  size: Size,
): number {
  return getColor(product, colorId)?.stock[size] ?? 0;
}

// Any color unless colorId is given, any size unless size is given.
export function hasStock(
  product: Product,
  size?: Size,
  colorId?: string,
): boolean {
  const sizes = size ? [size] : product.sizes;
  return product.colors
    .filter((color) => colorId === undefined || color.id === colorId)
    .some((color) => sizes.some((available) => (color.stock[available] ?? 0) > 0));
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "for",
  "of",
  "in",
  "on",
  "to",
  "and",
  "or",
  "with",
]);

function wordsOf(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

// A term matches a catalog word when it is that word, or starts it ("water" matches waterproof).
function termMatches(term: string, words: string[]): boolean {
  return words.some(
    (word) => word === term || (term.length >= 3 && word.startsWith(term)),
  );
}

export function searchProducts(filters: SearchFilters = {}): Product[] {
  const query = filters.query?.trim().toLowerCase();

  return products.filter((product) => {
    if (query) {
      const words = wordsOf(
        [
          product.name,
          product.description,
          product.category,
          ...product.tags,
          ...product.colors.map((color) => color.name),
        ].join(" "),
      );
      const terms = query
        .split(/\s+/)
        .filter((term) => term && !STOP_WORDS.has(term));
      if (terms.length > 0 && !terms.every((term) => termMatches(term, words))) {
        return false;
      }
    }

    if (filters.category && product.category !== filters.category) {
      return false;
    }

    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }

    if (filters.size && !product.sizes.includes(filters.size)) {
      return false;
    }

    if (filters.inStockOnly && !hasStock(product, filters.size)) {
      return false;
    }

    return true;
  });
}

export function getSuggestedProducts({
  categories,
  excludeIds = [],
  count,
}: {
  categories: Category[];
  excludeIds?: string[];
  count: number;
}): Product[] {
  return products
    .filter(
      (product) =>
        categories.includes(product.category) &&
        !excludeIds.includes(product.id) &&
        hasStock(product),
    )
    .slice(0, count);
}

export function getSimilarProducts(product: Product, count: number): Product[] {
  return getSuggestedProducts({
    categories: [product.category],
    excludeIds: [product.id],
    count,
  });
}

export function getSimilarInSize(
  product: Product,
  size: Size,
  count: number,
): Product[] {
  return products
    .filter(
      (other) =>
        other.id !== product.id &&
        other.category === product.category &&
        hasStock(other, size),
    )
    .slice(0, count);
}

// "featured" is catalog order.
export const SORTS = ["featured", "price-asc", "price-desc", "name"] as const;
export type Sort = (typeof SORTS)[number];

// Shared by the shop grid and search_products.
export const CATALOG_PAGE_SIZE = 6;

export function sortProducts(list: Product[], sort: Sort): Product[] {
  if (sort === "featured") return list;
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    const byPrice = sort === "price-asc" ? a.price - b.price : b.price - a.price;
    return byPrice || a.name.localeCompare(b.name);
  });
  return sorted;
}

export function getPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
}

// Pages count from 1.
export function getPage<T>(list: T[], page: number): T[] {
  return list.slice((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE);
}

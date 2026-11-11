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

/** Units in stock for one color and size (0 for an unknown color). */
export function getStock(
  product: Product,
  colorId: string,
  size: Size,
): number {
  return getColor(product, colorId)?.stock[size] ?? 0;
}

/** True when any color (or only `colorId`, if given) has stock in `size` (or in any size). */
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

/** In-stock products from `categories`, in catalog order, skipping `excludeIds`. */
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

/** Other in-stock products from the same category. */
export function getSimilarProducts(product: Product, count: number): Product[] {
  return getSuggestedProducts({
    categories: [product.category],
    excludeIds: [product.id],
    count,
  });
}

/** The first color and size, in catalog order, that has stock. */
export function firstAvailableVariant(
  product: Product,
): { colorId: string; size: Size } | undefined {
  for (const color of product.colors) {
    const size = product.sizes.find((value) => (color.stock[value] ?? 0) > 0);
    if (size) return { colorId: color.id, size };
  }
  return undefined;
}

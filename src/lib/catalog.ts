import productsData from "@/data/products.json";
import type { Product, ProductColor, SearchFilters, Size } from "@/lib/types";

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

export function searchProducts(filters: SearchFilters = {}): Product[] {
  const query = filters.query?.trim().toLowerCase();

  return products.filter((product) => {
    if (query) {
      const haystack = [
        product.name,
        product.description,
        ...product.tags,
        ...product.colors.map((color) => color.name),
      ]
        .join(" ")
        .toLowerCase();
      const terms = query.split(/\s+/);
      if (!terms.every((term) => haystack.includes(term))) {
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

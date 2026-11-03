import productsData from "@/data/products.json";
import type { Product, SearchFilters, Size } from "@/lib/types";

const products = productsData as Product[];

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getAllProducts(): Product[] {
  return products;
}

function hasStock(product: Product, size?: Size): boolean {
  if (size) {
    return (product.stock[size] ?? 0) > 0;
  }
  return product.sizes.some((available) => (product.stock[available] ?? 0) > 0);
}

export function searchProducts(filters: SearchFilters = {}): Product[] {
  const query = filters.query?.trim().toLowerCase();

  return products.filter((product) => {
    if (query) {
      const haystack = [product.name, product.description, ...product.tags]
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

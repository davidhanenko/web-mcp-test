"use client";

import { useMemo, useState } from "react";
import { searchProducts } from "@/lib/catalog";
import { CATEGORIES, SIZES, type Category, type Size } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export function CatalogExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [maxPrice, setMaxPrice] = useState("");
  const [size, setSize] = useState<Size | "">("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const products = useMemo(() => {
    const parsedMax = maxPrice === "" ? undefined : Number(maxPrice);
    return searchProducts({
      query: query || undefined,
      category: category || undefined,
      maxPrice:
        parsedMax !== undefined && Number.isFinite(parsedMax)
          ? parsedMax
          : undefined,
      size: size || undefined,
      inStockOnly: inStockOnly || undefined,
    });
  }, [query, category, maxPrice, size, inStockOnly]);

  return (
    <div>
      <form
        className="mb-8 grid gap-4 rounded-sm border border-[#1c2e24]/10 bg-white/50 p-4 md:grid-cols-5"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Product filters"
      >
        <div className="md:col-span-2">
          <label htmlFor="search" className="mb-1 block text-sm">
            Search
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-sm border border-[#1c2e24]/20 bg-white px-3"
            placeholder="Waterproof, wool, trail…"
          />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as Category | "")
            }
            className="h-10 w-full rounded-sm border border-[#1c2e24]/20 bg-white px-2"
          >
            <option value="">All</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="max-price" className="mb-1 block text-sm">
            Max price
          </label>
          <input
            id="max-price"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="h-10 w-full rounded-sm border border-[#1c2e24]/20 bg-white px-3"
          />
        </div>
        <div>
          <label htmlFor="size" className="mb-1 block text-sm">
            Size
          </label>
          <select
            id="size"
            value={size}
            onChange={(event) => setSize(event.target.value as Size | "")}
            className="h-10 w-full rounded-sm border border-[#1c2e24]/20 bg-white px-2"
          >
            <option value="">All</option>
            {SIZES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end md:col-span-5">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => setInStockOnly(event.target.checked)}
            />
            In stock only
          </label>
        </div>
      </form>

      {products.length === 0 ? (
        <p>No products match those filters.</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { ChipRadioGroup, type ChipOption } from "@/app/components/ChipRadioGroup";
import { SearchIcon } from "@/app/components/icons";
import { ProductCard } from "./ProductCard";
import { searchProducts } from "@/lib/catalog";
import { CATEGORIES, SIZES, type Category, type Size } from "@/lib/types";
import { PRICE_MAX, PRICE_MIN, useCatalogFilters } from "@/stores/catalog-filters";

const CATEGORY_OPTIONS: ChipOption<Category | "">[] = [
  { value: "", label: "All" },
  ...CATEGORIES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })),
];

const SIZE_OPTIONS: ChipOption<Size | "">[] = [
  { value: "", label: "Any" },
  ...SIZES.map((value) => ({ value, label: value })),
];

export function CatalogExplorer({
  initialCategory = "",
}: {
  initialCategory?: Category | "";
}) {
  const query = useCatalogFilters((s) => s.query);
  const category = useCatalogFilters((s) => s.category);
  const maxPrice = useCatalogFilters((s) => s.maxPrice);
  const size = useCatalogFilters((s) => s.size);
  const inStockOnly = useCatalogFilters((s) => s.inStockOnly);
  const setQuery = useCatalogFilters((s) => s.setQuery);
  const setCategory = useCatalogFilters((s) => s.setCategory);
  const setMaxPrice = useCatalogFilters((s) => s.setMaxPrice);
  const setSize = useCatalogFilters((s) => s.setSize);
  const setInStockOnly = useCatalogFilters((s) => s.setInStockOnly);
  const clearAll = useCatalogFilters((s) => s.clearAll);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory, setCategory]);

  const anyPrice = maxPrice >= PRICE_MAX;
  const priceText = anyPrice ? "Any price" : `$${maxPrice}`;

  const products = useMemo(
    () =>
      searchProducts({
        query: query || undefined,
        category: category || undefined,
        maxPrice: anyPrice ? undefined : maxPrice,
        size: size || undefined,
        inStockOnly: inStockOnly || undefined,
      }),
    [query, category, maxPrice, anyPrice, size, inStockOnly],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
      <aside className="self-start rounded-lg bg-panel p-7 lg:sticky lg:top-6">
        <form
          aria-labelledby="filters-heading"
          onSubmit={(event) => event.preventDefault()}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2
              id="filters-heading"
              className="text-sm font-bold tracking-[0.14em] uppercase [font-stretch:115%]"
            >
              Filters
            </h2>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-medium underline underline-offset-2 hover:text-muted"
            >
              Clear all
            </button>
          </div>

          <ChipRadioGroup
            legend="Category"
            name="category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            showCheck
          />

          <div>
            <div className="mb-4 flex items-baseline justify-between">
              <label htmlFor="max-price" className="label-caps">
                Max price
              </label>
              <span className="font-semibold" aria-hidden>
                {priceText}
              </span>
            </div>
            <input
              id="max-price"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={10}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              aria-valuetext={priceText}
              className="range-ink w-full"
            />
            <div
              className="mt-2 flex justify-between text-sm text-muted"
              aria-hidden
            >
              <span>${PRICE_MIN}</span>
              <span>${PRICE_MAX}+</span>
            </div>
          </div>

          <ChipRadioGroup
            legend="Size"
            name="size"
            options={SIZE_OPTIONS}
            value={size}
            onChange={setSize}
          />

          <fieldset>
            <legend className="label-caps mb-3">Availability</legend>
            <label className="inline-flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => setInStockOnly(event.target.checked)}
                className="h-5 w-5 accent-ink"
              />
              In stock only
            </label>
          </fieldset>
        </form>
      </aside>

      <section aria-labelledby="shop-heading">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 id="shop-heading" className="font-display text-4xl sm:text-5xl">
              Shop all
            </h1>
            <p role="status" className="mt-1 text-muted">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
          <div className="w-full sm:max-w-sm">
            <label htmlFor="search" className="label-caps mb-2 block">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
              <input
                id="search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “waterproof” or “wool”"
                className="h-12 w-full rounded-md border border-line bg-white pr-4 pl-11 placeholder:text-muted"
              />
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-12 text-center">
            <p className="text-lg font-semibold">
              No products match those filters.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 font-medium underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

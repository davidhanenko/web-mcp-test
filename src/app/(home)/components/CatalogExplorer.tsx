"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchIcon } from "@/app/components/icons";
import { SelectField } from "@/app/components/SelectField";
import { ProductCard } from "./ProductCard";
import { searchProducts } from "@/lib/catalog";
import { CATEGORIES, SIZES, type Category, type Product, type Size } from "@/lib/types";
import { PRICE_MAX, useCatalogFilters } from "@/stores/catalog-filters";

const PAGE_SIZE = 8;
const PRICE_STEPS = [50, 100, 150, 200, 250];

type Sort = "featured" | "price-asc" | "price-desc" | "name";

function priceOptions(current: number) {
  const steps = new Set(PRICE_STEPS);
  if (current !== PRICE_MAX) steps.add(current);
  return [
    { value: PRICE_MAX, label: "Any" },
    ...[...steps]
      .sort((a, b) => a - b)
      .map((value) => ({ value, label: `$${value}` })),
  ];
}

function sortProducts(products: Product[], sort: Sort): Product[] {
  if (sort === "featured") return products;
  const sorted = [...products];
  sorted.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    const byPrice = sort === "price-asc" ? a.price - b.price : b.price - a.price;
    return byPrice || a.name.localeCompare(b.name);
  });
  return sorted;
}

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

  const [sort, setSort] = useState<Sort>("featured");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory, setCategory]);

  const anyPrice = maxPrice >= PRICE_MAX;
  const filterKey = `${query}|${category}|${maxPrice}|${size}|${inStockOnly}|${sort}`;
  const [seenKey, setSeenKey] = useState(filterKey);
  if (seenKey !== filterKey) {
    setSeenKey(filterKey);
    setPage(1);
  }

  const products = useMemo(
    () =>
      sortProducts(
        searchProducts({
          query: query || undefined,
          category: category || undefined,
          maxPrice: anyPrice ? undefined : maxPrice,
          size: size || undefined,
          inStockOnly: inStockOnly || undefined,
        }),
        sort,
      ),
    [query, category, maxPrice, anyPrice, size, inStockOnly, sort],
  );

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function resetFilters() {
    setSort("featured");
    clearAll();
  }

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
              onClick={resetFilters}
              className="text-sm font-medium underline underline-offset-2 hover:text-muted"
            >
              Clear all
            </button>
          </div>

          <SelectField
            id="category"
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value as Category | "")}
          >
            <option value="">All</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="max-price"
            label="Max price"
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
          >
            {priceOptions(maxPrice).map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="size"
            label="Size"
            value={size}
            onChange={(event) => setSize(event.target.value as Size | "")}
          >
            <option value="">Any</option>
            {SIZES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectField>

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
          <div className="flex w-full flex-col gap-4 sm:max-w-md sm:flex-row sm:items-end">
            <div className="sm:w-44">
              <SelectField
                id="sort"
                label="Sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name</option>
              </SelectField>
            </div>
            <div className="min-w-0 flex-1">
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
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-12 text-center">
            <p className="text-lg font-semibold">
              No products match those filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 font-medium underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
            <nav
              aria-label="Pagination"
              className="mt-10 flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-11 rounded-md border border-line bg-white px-4 font-semibold disabled:cursor-not-allowed disabled:text-muted"
              >
                Previous
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    aria-current={number === currentPage ? "page" : undefined}
                    className={`h-11 min-w-11 rounded-md border px-3 font-semibold ${
                      number === currentPage
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white hover:bg-panel"
                    }`}
                  >
                    {number}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= pageCount}
                className="h-11 rounded-md border border-line bg-white px-4 font-semibold disabled:cursor-not-allowed disabled:text-muted"
              >
                Next
              </button>
            </nav>
          </>
        )}
      </section>
    </div>
  );
}

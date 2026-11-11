"use client";

import { create } from "zustand";
import { getAllProducts, type Sort } from "@/lib/catalog";
import type { Category, Size } from "@/lib/types";

export const PRICE_MIN = 10;
export const PRICE_STEP = 10;
/** The highest product price, rounded up to a whole step so the slider can reach it. */
export const PRICE_MAX =
  Math.ceil(
    Math.max(PRICE_MIN, ...getAllProducts().map((product) => product.price)) / PRICE_STEP,
  ) * PRICE_STEP;

type SearchFilters = {
  query?: string | null;
  category?: Category | null;
  maxPrice?: number | null;
  size?: Size | null;
  sort?: Sort | null;
  page?: number | null;
};

type CatalogFiltersState = {
  query: string;
  category: Category | "";
  maxPrice: number;
  size: Size | "";
  inStockOnly: boolean;
  sort: Sort;
  /** Shop grid page, from 1. Any filter or sort change goes back to page 1. */
  page: number;
  setQuery: (query: string) => void;
  setCategory: (category: Category | "") => void;
  setMaxPrice: (maxPrice: number) => void;
  setSize: (size: Size | "") => void;
  setInStockOnly: (inStockOnly: boolean) => void;
  setSort: (sort: Sort) => void;
  setPage: (page: number) => void;
  clearAll: () => void;
  /** Shows what search_products searched for, on the page it returned. */
  applyFromSearch: (input: SearchFilters) => void;
};

const defaults = {
  query: "",
  category: "" as const,
  maxPrice: PRICE_MAX,
  size: "" as const,
  inStockOnly: false,
  sort: "featured" as Sort,
  page: 1,
};

export const useCatalogFilters = create<CatalogFiltersState>((set) => ({
  ...defaults,
  setQuery: (query) => set({ query, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setMaxPrice: (maxPrice) => set({ maxPrice, page: 1 }),
  setSize: (size) => set({ size, page: 1 }),
  setInStockOnly: (inStockOnly) => set({ inStockOnly, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
  clearAll: () => set(defaults),
  applyFromSearch: (input) =>
    set({
      query: input.query || "",
      category: input.category || "",
      maxPrice: typeof input.maxPrice === "number" ? input.maxPrice : PRICE_MAX,
      size: input.size || "",
      inStockOnly: false,
      sort: input.sort || "featured",
      page: typeof input.page === "number" ? input.page : 1,
    }),
}));

"use client";

import { create } from "zustand";
import { getAllProducts } from "@/lib/catalog";
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
};

type CatalogFiltersState = {
  query: string;
  category: Category | "";
  maxPrice: number;
  size: Size | "";
  inStockOnly: boolean;
  setQuery: (query: string) => void;
  setCategory: (category: Category | "") => void;
  setMaxPrice: (maxPrice: number) => void;
  setSize: (size: Size | "") => void;
  setInStockOnly: (inStockOnly: boolean) => void;
  clearAll: () => void;
  applyFromSearch: (input: SearchFilters) => void;
};

const defaults = {
  query: "",
  category: "" as const,
  maxPrice: PRICE_MAX,
  size: "" as const,
  inStockOnly: false,
};

export const useCatalogFilters = create<CatalogFiltersState>((set) => ({
  ...defaults,
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setSize: (size) => set({ size }),
  setInStockOnly: (inStockOnly) => set({ inStockOnly }),
  clearAll: () => set(defaults),
  applyFromSearch: (input) =>
    set({
      query: input.query || "",
      category: input.category || "",
      maxPrice: typeof input.maxPrice === "number" ? input.maxPrice : PRICE_MAX,
      size: input.size || "",
      inStockOnly: false,
    }),
}));

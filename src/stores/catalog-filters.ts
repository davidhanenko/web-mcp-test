"use client";

import { create } from "zustand";
import type { Category, Size } from "@/lib/types";

export const PRICE_MIN = 10;
export const PRICE_MAX = 200;

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

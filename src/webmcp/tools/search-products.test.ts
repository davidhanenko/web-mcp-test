import { beforeEach, describe, expect, it } from "vitest";
import {
  CATALOG_PAGE_SIZE,
  getAllProducts,
  sortProducts,
} from "@/lib/catalog";
import { PRICE_MAX, useCatalogFilters } from "@/stores/catalog-filters";
import { page, resetStores, run } from "./test-utils";

type SearchResult = {
  totalMatches: number;
  page: number;
  pageCount: number;
  products: {
    productId: string;
    category: string;
    price: number;
    sizesInStock: string[];
  }[];
};

async function search(input: ModelContextToolInput = {}) {
  return (await run("search_products", input)) as unknown as SearchResult;
}

beforeEach(resetStores);

describe("search_products", () => {
  it("returns one page of the catalog with the page count", async () => {
    const total = getAllProducts().length;
    const result = await search();
    expect(result.totalMatches).toBe(total);
    expect(result.page).toBe(1);
    expect(result.pageCount).toBe(Math.ceil(total / CATALOG_PAGE_SIZE));
    expect(result.products).toHaveLength(CATALOG_PAGE_SIZE);
  });

  it("pages through every product once", async () => {
    const first = await search();
    const seen: string[] = [];
    for (let number = 1; number <= first.pageCount; number++) {
      const result = await search({ page: number });
      seen.push(...result.products.map((product) => product.productId));
    }
    expect(seen).toEqual(getAllProducts().map((product) => product.id));
  });

  it("sorts like the shop page", async () => {
    for (const sort of ["featured", "price-asc", "price-desc", "name"] as const) {
      const result = await search({ sort });
      const expected = sortProducts(getAllProducts(), sort)
        .slice(0, CATALOG_PAGE_SIZE)
        .map((product) => product.id);
      expect(result.products.map((product) => product.productId)).toEqual(expected);
    }
  });

  it("filters boots by US size, given as text or a number", async () => {
    for (const size of ["10", 10]) {
      const result = await search({ size });
      expect(result.totalMatches).toBe(
        getAllProducts().filter((product) => product.category === "boots").length,
      );
      expect(result.products.every((product) => product.category === "boots")).toBe(true);
    }
  });

  it("finds a waterproof jacket under $150 in M", async () => {
    const result = await search({
      query: "waterproof",
      category: "jackets",
      maxPrice: 150,
      size: "M",
    });
    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every((product) => product.price <= 150)).toBe(true);
  });

  it("lists only sizes that have stock in some color", async () => {
    const result = await search({ query: "mist trail" });
    expect(result.products[0]).toMatchObject({
      productId: "mist-trail-jacket",
      sizesInStock: ["XS", "S", "M", "L", "XL"],
    });
  });

  it("shows the same search, sort and page on the shop page", async () => {
    await search({ category: "socks", maxPrice: 30, sort: "price-asc", page: 2 });
    expect(useCatalogFilters.getState()).toMatchObject({
      query: "",
      category: "socks",
      maxPrice: 30,
      size: "",
      sort: "price-asc",
      page: 2,
    });
    expect(page.closeDrawer).toHaveBeenCalledOnce();
    expect(page.navigate).toHaveBeenCalledWith("/");
  });

  it("treats null and empty inputs as not given", async () => {
    const result = await search({
      query: "",
      category: null,
      maxPrice: null,
      size: "",
      sort: null,
      page: null,
    });
    expect(result.totalMatches).toBe(getAllProducts().length);
    expect(useCatalogFilters.getState().maxPrice).toBe(PRICE_MAX);
  });

  it("returns the valid values for an unknown category, size or sort", async () => {
    expect((await run("search_products", { category: "hats" })).error).toContain(
      "jackets, boots, socks, shirts",
    );
    expect((await run("search_products", { size: "XXL" })).error).toContain("XS");
    expect((await run("search_products", { sort: "newest" })).error).toContain(
      "price-asc",
    );
  });

  it("returns the page count for a page past the last one, and leaves the page alone", async () => {
    const result = await run("search_products", { page: 99 });
    expect(result.error).toBeDefined();
    expect(result.pageCount).toBe(Math.ceil(getAllProducts().length / CATALOG_PAGE_SIZE));
    expect(page.navigate).not.toHaveBeenCalled();
  });

  it("returns an error for a maxPrice of 0 or less, or the wrong type", async () => {
    for (const maxPrice of [0, -5, "cheap"]) {
      expect((await run("search_products", { maxPrice })).error).toContain("maxPrice");
    }
    expect((await run("search_products", { query: 5 })).error).toContain("query");
    expect((await run("search_products", { page: 1.5 })).error).toContain("page");
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { PRICE_MAX, useCatalogFilters } from "@/stores/catalog-filters";

const filters = () => useCatalogFilters.getState();

beforeEach(() => filters().clearAll());

describe("useCatalogFilters", () => {
  it("goes back to page 1 when a filter or the sort changes", () => {
    const changes = [
      () => filters().setQuery("wool"),
      () => filters().setCategory("socks"),
      () => filters().setMaxPrice(50),
      () => filters().setSize("M"),
      () => filters().setInStockOnly(true),
      () => filters().setSort("name"),
    ];
    for (const change of changes) {
      filters().setPage(3);
      change();
      expect(filters().page).toBe(1);
    }
  });

  it("keeps the page and sort a search asks for", () => {
    filters().applyFromSearch({ category: "jackets", sort: "price-desc", page: 2 });
    expect(filters()).toMatchObject({
      category: "jackets",
      maxPrice: PRICE_MAX,
      sort: "price-desc",
      page: 2,
    });
  });

  it("clears the sort and page with the filters", () => {
    filters().applyFromSearch({ sort: "name", page: 2 });
    filters().clearAll();
    expect(filters()).toMatchObject({ sort: "featured", page: 1 });
  });
});

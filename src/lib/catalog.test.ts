import { describe, expect, it } from "vitest";
import { getProduct, searchProducts } from "@/lib/catalog";

describe("searchProducts", () => {
  it("matches query against name, description, and tags", () => {
    const byName = searchProducts({ query: "mist trail" });
    expect(byName.map((p) => p.id)).toContain("mist-trail-jacket");

    const byTag = searchProducts({ query: "MERINO" });
    expect(byTag.length).toBeGreaterThan(0);
    expect(byTag.every((p) => p.tags.some((t) => t.toLowerCase().includes("merino")) || p.name.toLowerCase().includes("merino") || p.description.toLowerCase().includes("merino"))).toBe(true);

    const byDescription = searchProducts({ query: "hipbelt" });
    expect(byDescription.map((p) => p.id)).toEqual(["cedar-rain-shell"]);
  });

  it("filters by category", () => {
    const jackets = searchProducts({ category: "jackets" });
    expect(jackets.length).toBeGreaterThan(0);
    expect(jackets.every((p) => p.category === "jackets")).toBe(true);
  });

  it("filters by max price", () => {
    const cheap = searchProducts({ maxPrice: 20 });
    expect(cheap.every((p) => p.price <= 20)).toBe(true);
    expect(cheap.some((p) => p.category === "socks")).toBe(true);
  });

  it("filters by size", () => {
    const xs = searchProducts({ size: "XS" });
    expect(xs.every((p) => p.sizes.includes("XS"))).toBe(true);
    expect(xs.some((p) => p.category === "boots")).toBe(false);
  });

  it("filters to in-stock items", () => {
    const inStockM = searchProducts({ size: "M", inStockOnly: true });
    expect(inStockM.map((p) => p.id)).not.toContain("dusk-wind-shell");
    expect(inStockM.every((p) => (p.stock.M ?? 0) > 0)).toBe(true);
  });

  it("combines filters", () => {
    const results = searchProducts({
      query: "wool",
      category: "socks",
      maxPrice: 25,
      size: "M",
      inStockOnly: true,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (p) =>
          p.category === "socks" &&
          p.price <= 25 &&
          p.sizes.includes("M") &&
          (p.stock.M ?? 0) > 0,
      ),
    ).toBe(true);
  });

  it("finds waterproof jackets under $150 in M", () => {
    const results = searchProducts({
      query: "waterproof",
      category: "jackets",
      maxPrice: 150,
      size: "M",
      inStockOnly: true,
    });
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.every((p) => p.price < 150)).toBe(true);
    expect(results.every((p) => p.sizes.includes("M") && (p.stock.M ?? 0) > 0)).toBe(
      true,
    );
    expect(results.every((p) => p.tags.includes("waterproof"))).toBe(true);
  });
});

describe("getProduct", () => {
  it("returns a product by id and undefined when missing", () => {
    expect(getProduct("mist-trail-jacket")?.name).toBe("Mist Trail Jacket");
    expect(getProduct("no-such-item")).toBeUndefined();
  });
});

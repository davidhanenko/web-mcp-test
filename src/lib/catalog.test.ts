import { describe, expect, it } from "vitest";
import {
  firstAvailableVariant,
  getProduct,
  getSimilarProducts,
  getStock,
  hasStock,
  searchProducts,
} from "@/lib/catalog";

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

  it("matches query against color names", () => {
    const results = searchProducts({ query: "burgundy" });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((p) => p.colors.some((c) => c.name === "Burgundy")),
    ).toBe(true);
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
    expect(inStockM.every((p) => hasStock(p, "M"))).toBe(true);
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
          hasStock(p, "M"),
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
    expect(results.every((p) => p.sizes.includes("M") && hasStock(p, "M"))).toBe(
      true,
    );
    expect(results.every((p) => p.tags.includes("waterproof"))).toBe(true);
  });
});

describe("getStock and hasStock", () => {
  it("reads stock per color and size", () => {
    const jacket = getProduct("mist-trail-jacket")!;
    expect(getStock(jacket, "blue", "M")).toBe(3);
    expect(getStock(jacket, "no-such-color", "M")).toBe(0);
    expect(hasStock(jacket, "M", "blue")).toBe(true);
    expect(hasStock(jacket, "M", "no-such-color")).toBe(false);
    expect(hasStock(getProduct("dusk-wind-shell")!, "M")).toBe(false);
  });
});

describe("getProduct", () => {
  it("returns a product by id and undefined when missing", () => {
    expect(getProduct("mist-trail-jacket")?.name).toBe("Mist Trail Jacket");
    expect(getProduct("no-such-item")).toBeUndefined();
  });
});

describe("getSimilarProducts", () => {
  it("returns other in-stock products from the same category", () => {
    const jacket = getProduct("mist-trail-jacket")!;
    const similar = getSimilarProducts(jacket, 3);
    expect(similar).toHaveLength(3);
    expect(similar.every((p) => p.category === "jackets")).toBe(true);
    expect(similar.map((p) => p.id)).not.toContain(jacket.id);
    expect(similar.every((p) => hasStock(p))).toBe(true);
  });
});

describe("firstAvailableVariant", () => {
  it("skips sold-out colors and sizes", () => {
    const jacket = getProduct("mist-trail-jacket")!;
    const variant = firstAvailableVariant(jacket)!;
    expect(getStock(jacket, variant.colorId, variant.size)).toBeGreaterThan(0);
  });
});

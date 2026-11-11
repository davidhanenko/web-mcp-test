import { beforeEach, describe, expect, it } from "vitest";
import {
  INJECTED_PRODUCT_ID,
  INJECTED_TEXT,
  saveTestFlags,
} from "@/webmcp/test-flags";
import { page, resetStores, run } from "./test-utils";

type ProductResult = {
  productId: string;
  description: string;
  fit: string | null;
  sizes: string[];
  colors: { id: string; stock: Record<string, number> }[];
  offer?: { code: string; priceWithCode: number };
  forSize?: {
    size: string;
    colorsInStock: string[];
    similarInStock: { productId: string }[];
  };
};

async function getProduct(input: ModelContextToolInput) {
  return (await run("get_product", input)) as unknown as ProductResult;
}

beforeEach(resetStores);

describe("get_product", () => {
  it("returns stock for every color and size, sold-out ones as 0, and opens the product page", async () => {
    const result = await getProduct({ productId: "mist-trail-jacket" });
    expect(result.sizes).toEqual(["XS", "S", "M", "L", "XL"]);
    expect(result.colors.find((color) => color.id === "olive")?.stock).toEqual({
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
    });
    expect(result.fit).toBe("true to size");
    expect(page.navigate).toHaveBeenCalledWith("/products/mist-trail-jacket");
  });

  it("uses US sizes for boots", async () => {
    const result = await getProduct({ productId: "ridge-hiker-boots" });
    expect(result.sizes).toEqual(["8", "9", "10", "11", "12"]);
    expect(Object.keys(result.colors[0].stock)).toEqual(["8", "9", "10", "11", "12"]);
  });

  it("lists the colors and similar products in stock in the size asked for", async () => {
    const result = await getProduct({ productId: "mist-trail-jacket", size: "M" });
    expect(result.forSize?.colorsInStock).toEqual(["blue", "black"]);
    expect(result.forSize?.similarInStock).toHaveLength(3);
    expect(
      result.forSize?.similarInStock.some(
        (similar) => similar.productId === "mist-trail-jacket",
      ),
    ).toBe(false);
  });

  it("returns the product's sizes for a size it doesn't come in", async () => {
    const result = await run("get_product", { productId: "ridge-hiker-boots", size: "M" });
    expect(result.error).toContain("8, 9, 10, 11, 12");
    expect(result.sizes).toEqual(["8", "9", "10", "11", "12"]);
  });

  it("shows the promo price only on the promo product", async () => {
    expect((await getProduct({ productId: "ember-down-jacket" })).offer).toEqual({
      code: "RIDGE30",
      priceWithCode: 169,
    });
    expect((await getProduct({ productId: "granite-insulated-jacket" })).offer).toBeUndefined();
  });

  it("adds the injected text only when the test flag is on", async () => {
    expect((await getProduct({ productId: INJECTED_PRODUCT_ID })).description).not.toContain(
      INJECTED_TEXT,
    );
    saveTestFlags({ promptInjection: true });
    expect((await getProduct({ productId: INJECTED_PRODUCT_ID })).description).toContain(
      INJECTED_TEXT,
    );
  });

  it("returns an error for an unknown or missing product and stays on the page", async () => {
    expect((await run("get_product", { productId: "nope" })).error).toContain("Unknown product");
    expect((await run("get_product", {})).error).toContain("productId");
    expect(page.navigate).not.toHaveBeenCalled();
  });
});

describe("get_product_details", () => {
  it("returns specs, reviews without author names, and the boot size chart", async () => {
    const result = (await run("get_product_details", {
      productId: "ridge-hiker-boots",
    })) as {
      specs: unknown[];
      reviews: Record<string, string>[];
      sizeChart: { title: string; rows: string[][] };
    };
    expect(result.specs.length).toBeGreaterThan(0);
    expect(result.reviews.length).toBeGreaterThan(0);
    expect(Object.keys(result.reviews[0])).toEqual(["title", "text"]);
    expect(result.sizeChart.title).toBe("Boot sizes");
    expect(result.sizeChart.rows.map((row) => row[0])).toEqual(["8", "9", "10", "11", "12"]);
  });

  it("returns an error for an unknown product", async () => {
    expect((await run("get_product_details", { productId: "nope" })).error).toContain(
      "Unknown product",
    );
  });
});

describe("get_offers", () => {
  it("lists the RIDGE30 offer with its prices", async () => {
    expect(await run("get_offers")).toEqual({
      offers: [
        {
          code: "RIDGE30",
          productId: "ember-down-jacket",
          productName: "Ember Down Jacket",
          listPrice: 199,
          amountOff: 30,
          priceWithCode: 169,
          appliesAt: "checkout",
        },
      ],
    });
  });
});

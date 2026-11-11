import { beforeEach, describe, expect, it } from "vitest";
import { getAllProducts } from "@/lib/catalog";
import { useCart } from "@/stores/cart";
import {
  LARGE_CART,
  MAX_RESULT_LENGTH,
  resetStores,
  resultLength,
  run,
  tools,
} from "./test-utils";

beforeEach(resetStores);

describe("tool definitions", () => {
  it("has the eight imperative tools in shopping order, within Chrome's size limits", () => {
    expect(tools.map((tool) => tool.name)).toEqual([
      "search_products",
      "get_product",
      "get_product_details",
      "get_offers",
      "get_cart",
      "update_cart",
      "apply_promo_code",
      "open_checkout",
    ]);
    for (const tool of tools) {
      expect(tool.name.length).toBeLessThanOrEqual(30);
      expect(tool.description.length).toBeLessThanOrEqual(500);
      const properties = tool.inputSchema.properties as Record<
        string,
        { description?: string }
      >;
      for (const [name, property] of Object.entries(properties)) {
        expect(name.length).toBeLessThanOrEqual(30);
        expect(property.description?.length ?? 0).toBeLessThanOrEqual(150);
      }
    }
  });

  it("marks only the read tools as read-only", () => {
    const readOnly = tools
      .filter((tool) => tool.annotations?.readOnlyHint)
      .map((tool) => tool.name);
    expect(readOnly).toEqual([
      "search_products",
      "get_product",
      "get_product_details",
      "get_offers",
      "get_cart",
    ]);
  });
});

describe("result size", () => {
  it("keeps every product's results under Chrome's limit", async () => {
    for (const product of getAllProducts()) {
      for (const size of [undefined, ...product.sizes]) {
        const result = await run("get_product", { productId: product.id, size });
        expect(result.error).toBeUndefined();
        expect(resultLength(result)).toBeLessThan(MAX_RESULT_LENGTH);
      }
      const details = await run("get_product_details", { productId: product.id });
      expect(resultLength(details)).toBeLessThan(MAX_RESULT_LENGTH);
    }
  });

  it("keeps every search page under Chrome's limit", async () => {
    const first = await run("search_products", {});
    for (let page = 1; page <= (first.pageCount as number); page++) {
      const result = await run("search_products", { page });
      expect(resultLength(result)).toBeLessThan(MAX_RESULT_LENGTH);
    }
  });

  it("keeps a 10-item cart under Chrome's limit in every cart tool", async () => {
    const updated = await run("update_cart", { items: LARGE_CART });
    expect(updated.error).toBeUndefined();
    expect(useCart.getState().items).toHaveLength(10);
    expect(resultLength(updated)).toBeLessThan(MAX_RESULT_LENGTH);

    await run("apply_promo_code", { code: "RIDGE30" });
    for (const name of ["get_cart", "open_checkout"]) {
      expect(resultLength(await run(name))).toBeLessThan(MAX_RESULT_LENGTH);
    }
  });
});

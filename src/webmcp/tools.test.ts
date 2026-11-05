import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllProducts } from "@/lib/catalog";
import { useCart } from "@/stores/cart";
import {
  INJECTED_PRODUCT_ID,
  INJECTED_TEXT,
  saveTestFlags,
} from "@/webmcp/test-flags";
import { createTools } from "@/webmcp/tools";

// Chrome's limit for one tool's result, in characters (docs/research.md).
const MAX_RESULT_LENGTH = 1500;

type SearchResult = {
  totalMatches: number;
  products: { productId: string; price: number; sizesInStock: string[] }[];
};

const openCheckout = vi.fn();
const tools = createTools({ openCheckout });
const client = { signal: new AbortController().signal };

/** Calls a tool the way the browser does. */
async function run(name: string, input: ModelContextToolInput = {}) {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`No tool named ${name}`);
  return tool.execute(input, client);
}

beforeEach(() => {
  localStorage.clear();
  useCart.setState({ items: [] });
  openCheckout.mockClear();
});

describe("tool definitions", () => {
  it("has the six imperative tools within Chrome's size limits", () => {
    expect(tools.map((tool) => tool.name)).toEqual([
      "search_products",
      "get_product",
      "get_cart",
      "add_to_cart",
      "remove_from_cart",
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
});

describe("search_products", () => {
  it("finds a waterproof jacket under $150 in M", async () => {
    const result = (await run("search_products", {
      query: "waterproof",
      category: "jackets",
      maxPrice: 150,
      size: "M",
    })) as SearchResult;
    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every((product) => product.price <= 150)).toBe(true);
  });

  it("returns at most 10 products and the real number of matches, within Chrome's limit", async () => {
    const result = (await run("search_products")) as SearchResult;
    expect(result.products).toHaveLength(10);
    expect(result.totalMatches).toBe(getAllProducts().length);
    expect(JSON.stringify(result).length).toBeLessThan(MAX_RESULT_LENGTH);
  });

  it("lists only sizes that have stock in some color", async () => {
    // Dusk Wind Shell has no size M in any color.
    const result = (await run("search_products", {
      query: "dusk wind",
    })) as SearchResult;
    expect(result.products).toEqual([
      expect.objectContaining({
        productId: "dusk-wind-shell",
        sizesInStock: ["XS", "S", "L", "XL"],
      }),
    ]);
  });

  it("treats null and empty filters as not given", async () => {
    const result = (await run("search_products", {
      query: "",
      category: null,
      maxPrice: null,
      size: null,
    })) as SearchResult;
    expect(result.totalMatches).toBe(getAllProducts().length);
  });

  it("returns the valid values for an unknown category or size", async () => {
    expect(await run("search_products", { category: "jacket" })).toEqual({
      error: "Unknown category: jacket. Use one of: jackets, boots, socks, shirts.",
    });
    expect(await run("search_products", { size: "XXL" })).toEqual({
      error: "Unknown size: XXL. Use one of: XS, S, M, L, XL.",
    });
  });

  it("returns an error for a filter of the wrong type", async () => {
    expect(await run("search_products", { maxPrice: "150" })).toEqual({
      error: "maxPrice must be a number in USD.",
    });
    expect(await run("search_products", { query: 42 })).toEqual({
      error: "query must be text.",
    });
  });
});

describe("get_product", () => {
  it("returns stock per color and size, within Chrome's limit", async () => {
    const result = (await run("get_product", {
      productId: "mist-trail-jacket",
    })) as { colors: unknown[] };
    expect(result.colors[0]).toEqual({
      id: "blue",
      name: "Blue",
      stock: { XS: 2, S: 2, M: 3, L: 2, XL: 1 },
    });
    expect(JSON.stringify(result).length).toBeLessThan(MAX_RESULT_LENGTH);
  });

  it("adds the injected text only when the test flag is on", async () => {
    const description = async () =>
      ((await run("get_product", { productId: INJECTED_PRODUCT_ID })) as {
        description: string;
      }).description;

    expect(await description()).not.toContain(INJECTED_TEXT);
    saveTestFlags({ promptInjection: true });
    const result = await run("get_product", { productId: INJECTED_PRODUCT_ID });
    expect(await description()).toContain(INJECTED_TEXT);
    expect(JSON.stringify(result).length).toBeLessThan(MAX_RESULT_LENGTH);
  });

  it("returns an error for an unknown product", async () => {
    expect(await run("get_product", { productId: "nope" })).toEqual({
      error: "Unknown product: nope",
    });
  });
});

describe("get_cart", () => {
  it("lists each item with its unit price, plus the totals", async () => {
    useCart.getState().addToCart("mist-trail-jacket", "M", "blue", 2);
    expect(await run("get_cart")).toEqual({
      items: [
        {
          productId: "mist-trail-jacket",
          name: "Mist Trail Jacket",
          size: "M",
          color: "blue",
          quantity: 2,
          unitPrice: 128,
        },
      ],
      total: 256,
      totalQuantity: 2,
    });
  });
});

describe("add_to_cart", () => {
  const blueJacketInM = {
    productId: "mist-trail-jacket",
    size: "M",
    color: "blue",
  };

  it("adds one by default and returns the updated cart", async () => {
    expect(await run("add_to_cart", blueJacketInM)).toMatchObject({
      items: [{ ...blueJacketInM, quantity: 1 }],
      total: 128,
    });
    // The UI and the tools share one store.
    expect(useCart.getState().items).toHaveLength(1);
  });

  it("treats a null quantity as 1", async () => {
    expect(
      await run("add_to_cart", { ...blueJacketInM, quantity: null }),
    ).toMatchObject({ totalQuantity: 1 });
  });

  it("says what is in stock when the size is out of stock", async () => {
    expect(
      await run("add_to_cart", {
        productId: "dusk-wind-shell",
        size: "M",
        color: "teal",
      }),
    ).toEqual({
      error: "Dusk Wind Shell in Teal, size M is out of stock.",
      inStock: { teal: ["XS", "S", "L", "XL"], black: ["XS", "S", "L"] },
    });
    expect(useCart.getState().items).toEqual([]);
  });

  it("lists every color, even one with nothing in stock, when the color is unknown", async () => {
    expect(
      await run("add_to_cart", { ...blueJacketInM, color: "pink" }),
    ).toEqual({
      error: "Invalid color pink for Mist Trail Jacket.",
      inStock: {
        blue: ["XS", "S", "M", "L", "XL"],
        black: ["XS", "S", "M", "L", "XL"],
        olive: [],
      },
    });
  });

  it("returns only the error for an unknown product", async () => {
    expect(
      await run("add_to_cart", { ...blueJacketInM, productId: "nope" }),
    ).toEqual({ error: "Unknown product: nope" });
  });

  it("returns the store's error for a bad quantity or a missing size", async () => {
    expect(
      await run("add_to_cart", { ...blueJacketInM, quantity: 0 }),
    ).toMatchObject({ error: "Quantity must be a positive whole number." });
    expect(
      await run("add_to_cart", { productId: "mist-trail-jacket", color: "blue" }),
    ).toMatchObject({ error: expect.stringMatching(/invalid size/i) });
  });
});

describe("remove_from_cart", () => {
  it("removes exactly one item", async () => {
    const { addToCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", "blue", 1);
    addToCart("mist-trail-jacket", "M", "black", 1);

    const cart = (await run("remove_from_cart", {
      productId: "mist-trail-jacket",
      size: "M",
      color: "blue",
    })) as { items: { color: string }[] };
    expect(cart.items.map((item) => item.color)).toEqual(["black"]);
  });

  it("returns an error when the item isn't in the cart", async () => {
    expect(
      await run("remove_from_cart", {
        productId: "mist-trail-jacket",
        size: "M",
        color: "blue",
      }),
    ).toEqual({ error: "mist-trail-jacket in blue, size M is not in the cart." });
  });

  it("removes nothing when the size or color is missing", async () => {
    useCart.getState().addToCart("mist-trail-jacket", "M", "blue", 1);
    expect(
      await run("remove_from_cart", { productId: "mist-trail-jacket" }),
    ).toMatchObject({ error: expect.stringMatching(/not in the cart/) });
    expect(useCart.getState().items).toHaveLength(1);
  });
});

describe("open_checkout", () => {
  it("opens checkout and does not clear the cart", async () => {
    useCart.getState().addToCart("mist-trail-jacket", "M", "blue", 1);
    await run("open_checkout");
    expect(openCheckout).toHaveBeenCalledOnce();
    expect(useCart.getState().items).toHaveLength(1);
  });
});

import { describe, expect, it } from "vitest";
import { assertAvailable, getCartDetails, getTotalQuantity } from "@/lib/cart";

describe("getCartDetails", () => {
  it("adds names, unit prices, subtotals and totals from the catalog", () => {
    const cart = getCartDetails([
      { productId: "mist-trail-jacket", size: "M", color: "blue", quantity: 2 },
      { productId: "merino-crew-socks", size: "S", color: "grey", quantity: 1 },
    ]);
    expect(cart.items[0]).toMatchObject({
      name: "Mist Trail Jacket",
      colorName: "Blue",
      colorHex: "#3B6FA8",
      unitPrice: 128,
      subtotal: 256,
    });
    expect(cart.total).toBe(256 + 18);
    expect(cart.totalQuantity).toBe(3);
  });

  it("returns an empty cart for no items", () => {
    expect(getCartDetails([])).toEqual({
      items: [],
      total: 0,
      totalQuantity: 0,
    });
  });
});

describe("getTotalQuantity", () => {
  it("sums quantities across items", () => {
    expect(getTotalQuantity([{ quantity: 2 }, { quantity: 3 }])).toBe(5);
    expect(getTotalQuantity([])).toBe(0);
  });
});

describe("assertAvailable", () => {
  it("accepts an available quantity and rejects bad sizes and stock", () => {
    expect(() => assertAvailable("mist-trail-jacket", "M", "blue", 1)).not.toThrow();
    expect(() => assertAvailable("mist-trail-jacket", "XXL", "blue", 1)).toThrow(
      /invalid size/i,
    );
    expect(() => assertAvailable("mist-trail-jacket", "M", "pink", 1)).toThrow(
      /invalid color/i,
    );
    expect(() => assertAvailable("dusk-wind-shell", "M", "teal", 1)).toThrow(
      /out of stock/i,
    );
    expect(() => assertAvailable("mist-trail-jacket", "M", "blue", 99)).toThrow(
      /only 3 left/i,
    );
  });
});

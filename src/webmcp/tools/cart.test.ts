import { beforeEach, describe, expect, it } from "vitest";
import { useAgentCartChanges } from "@/stores/agent-cart-changes";
import { useCart } from "@/stores/cart";
import { page, resetStores, run } from "./test-utils";

const BOOTS = { productId: "ridge-hiker-boots", color: "black", size: "10", quantity: 1 };
const SOCKS = { productId: "merino-crew-socks", color: "navy", size: "M", quantity: 2 };

function cartItems() {
  return useCart.getState().items;
}

beforeEach(resetStores);

describe("get_cart", () => {
  it("lists each item with its unit price, plus the totals and no code", async () => {
    useCart.getState().addToCart("merino-crew-socks", "M", "navy", 2);
    expect(await run("get_cart")).toEqual({
      items: [
        {
          productId: "merino-crew-socks",
          name: "Merino Crew Socks",
          size: "M",
          color: "navy",
          quantity: 2,
          unitPrice: 18,
        },
      ],
      total: 36,
      totalQuantity: 2,
      appliedCode: null,
      discount: 0,
      payTotal: 36,
    });
  });
});

describe("update_cart", () => {
  it("sets several items at once, opens the drawer and records one agent change", async () => {
    const result = await run("update_cart", { items: [BOOTS, SOCKS] });
    expect(result.changedItems).toBe(2);
    expect(cartItems()).toEqual([
      { productId: "ridge-hiker-boots", size: "10", color: "black", quantity: 1 },
      { productId: "merino-crew-socks", size: "M", color: "navy", quantity: 2 },
    ]);
    expect((result.cart as { total: number }).total).toBe(168 + 36);
    expect(page.openDrawer).toHaveBeenCalledOnce();
    expect(useAgentCartChanges.getState().count).toBe(1);
  });

  it("gives the same cart when called twice, so a retry is safe", async () => {
    await run("update_cart", { items: [BOOTS, SOCKS] });
    const again = await run("update_cart", { items: [BOOTS, SOCKS] });
    expect(again.changedItems).toBe(0);
    expect(cartItems().map((item) => item.quantity)).toEqual([1, 2]);
    expect(useAgentCartChanges.getState().count).toBe(1);
  });

  it("sets the final quantity instead of adding to it", async () => {
    useCart.getState().addToCart("merino-crew-socks", "M", "navy", 1);
    await run("update_cart", { items: [{ ...SOCKS, quantity: 3 }] });
    expect(cartItems()[0].quantity).toBe(3);
  });

  it("swaps a size in one call", async () => {
    useCart.getState().addToCart("sun-trail-shirt", "M", "sand", 1);
    await run("update_cart", {
      items: [
        { productId: "sun-trail-shirt", color: "sand", size: "M", quantity: 0 },
        { productId: "sun-trail-shirt", color: "sand", size: "L", quantity: 1 },
      ],
    });
    expect(cartItems()).toEqual([
      { productId: "sun-trail-shirt", size: "L", color: "sand", quantity: 1 },
    ]);
  });

  it("removes an item at 0, and does nothing for an item that isn't in the cart", async () => {
    useCart.getState().addToCart("merino-crew-socks", "M", "navy", 2);
    await run("update_cart", { items: [{ ...SOCKS, quantity: 0 }] });
    expect(cartItems()).toEqual([]);

    const again = await run("update_cart", { items: [{ ...SOCKS, quantity: 0 }] });
    expect(again.error).toBeUndefined();
    expect(again.changedItems).toBe(0);
    expect(page.openDrawer).not.toHaveBeenCalled();
  });

  it("accepts a boot size as a number and a color by name", async () => {
    await run("update_cart", { items: [{ ...BOOTS, size: 10, color: "Black" }] });
    expect(cartItems()).toEqual([
      { productId: "ridge-hiker-boots", size: "10", color: "black", quantity: 1 },
    ]);
  });

  it("changes nothing when one item fails, and says what is in stock", async () => {
    useCart.getState().addToCart("merino-crew-socks", "M", "navy", 1);
    const result = await run("update_cart", {
      items: [
        BOOTS,
        { productId: "mist-trail-jacket", color: "olive", size: "M", quantity: 1 },
      ],
    });
    expect(result.error).toContain("Item 2");
    expect(result.error).toContain("out of stock");
    expect(result.itemIndex).toBe(1);
    expect((result.inStockByColor as Record<string, string[]>).olive).toEqual([]);
    expect(cartItems()).toEqual([
      { productId: "merino-crew-socks", size: "M", color: "navy", quantity: 1 },
    ]);
    expect(useAgentCartChanges.getState().count).toBe(0);
  });

  it("returns an error for more than the stock", async () => {
    const result = await run("update_cart", {
      items: [{ productId: "mist-trail-jacket", color: "blue", size: "M", quantity: 4 }],
    });
    expect(result.error).toContain("Only 3 left");
    expect(cartItems()).toEqual([]);
  });

  it("returns an error for the same item listed twice", async () => {
    const result = await run("update_cart", { items: [SOCKS, { ...SOCKS, quantity: 1 }] });
    expect(result.error).toContain("listed twice");
    expect(cartItems()).toEqual([]);
  });

  it("returns the product's sizes for a letter size on boots", async () => {
    const result = await run("update_cart", { items: [{ ...BOOTS, size: "M" }] });
    expect(result.error).toContain("8, 9, 10, 11, 12");
    expect(result.sizes).toEqual(["8", "9", "10", "11", "12"]);
  });

  it("returns an error for bad items and bad quantities", async () => {
    for (const items of [undefined, [], "boots", new Array(11).fill(BOOTS)]) {
      expect((await run("update_cart", { items })).error).toContain("1 to 10 items");
    }
    for (const quantity of [-1, 1.5, "2", null]) {
      expect((await run("update_cart", { items: [{ ...BOOTS, quantity }] })).error).toContain(
        "quantity",
      );
    }
    expect((await run("update_cart", { items: [{ ...BOOTS, productId: "nope" }] })).error).toContain(
      "Unknown product",
    );
    expect((await run("update_cart", { items: [{ ...BOOTS, color: "pink" }] })).error).toContain(
      "brown, black",
    );
    expect(cartItems()).toEqual([]);
  });
});

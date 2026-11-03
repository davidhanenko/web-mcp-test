import { beforeEach, describe, expect, it } from "vitest";
import { CART_STORAGE_KEY, useCart } from "@/stores/cart";

function resetCart() {
  localStorage.clear();
  useCart.setState({ items: [] });
}

describe("useCart", () => {
  beforeEach(() => {
    resetCart();
  });

  it("adds an item through getState", () => {
    useCart.getState().addToCart("mist-trail-jacket", "M", 1);
    const cart = useCart.getState().getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      productId: "mist-trail-jacket",
      size: "M",
      quantity: 1,
    });
    expect(cart.total).toBe(128);
  });

  it("adds twice to the same item", () => {
    const { addToCart, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", 1);
    addToCart("mist-trail-jacket", "M", 1);
    const cart = getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.total).toBe(256);
  });

  it("throws for an invalid size", () => {
    expect(() =>
      useCart.getState().addToCart("mist-trail-jacket", "XXL", 1),
    ).toThrow(/invalid size/i);
  });

  it("throws when out of stock", () => {
    expect(() =>
      useCart.getState().addToCart("dusk-wind-shell", "M", 1),
    ).toThrow(/out of stock/i);
  });

  it("throws for an unknown product", () => {
    expect(() => useCart.getState().addToCart("nope", "M", 1)).toThrow(
      /unknown product/i,
    );
  });

  it("removes an item and updates the total", () => {
    const { addToCart, removeFromCart, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", 1);
    addToCart("merino-crew-socks", "S", 2);
    expect(getCart().total).toBe(128 + 36);
    removeFromCart("mist-trail-jacket", "M");
    const cart = getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe("merino-crew-socks");
    expect(cart.total).toBe(36);
  });
});

describe("useCart.setQuantity", () => {
  beforeEach(() => {
    resetCart();
  });

  it("sets the quantity of an existing item", () => {
    const { addToCart, setQuantity, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", 1);
    setQuantity("mist-trail-jacket", "M", 3);
    const cart = getCart();
    expect(cart.items[0].quantity).toBe(3);
    expect(cart.total).toBe(128 * 3);
  });

  it("removes the item when set to 0", () => {
    const { addToCart, setQuantity, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", 2);
    setQuantity("mist-trail-jacket", "M", 0);
    expect(getCart().items).toHaveLength(0);
  });

  it("throws when the quantity exceeds stock", () => {
    const { addToCart, setQuantity } = useCart.getState();
    addToCart("mist-trail-jacket", "M", 1);
    expect(() => setQuantity("mist-trail-jacket", "M", 99)).toThrow(
      /only 8 left/i,
    );
  });

  it("throws for a negative or fractional quantity", () => {
    const { addToCart, setQuantity } = useCart.getState();
    addToCart("mist-trail-jacket", "M", 1);
    expect(() => setQuantity("mist-trail-jacket", "M", -1)).toThrow(
      /whole number/i,
    );
    expect(() => setQuantity("mist-trail-jacket", "M", 1.5)).toThrow(
      /whole number/i,
    );
  });

  it("throws for an unknown product or an item not in the cart", () => {
    const { setQuantity } = useCart.getState();
    expect(() => setQuantity("nope", "M", 1)).toThrow(/unknown product/i);
    expect(() => setQuantity("mist-trail-jacket", "M", 1)).toThrow(
      /not in the cart/i,
    );
  });
});

describe("saved cart", () => {
  beforeEach(() => {
    resetCart();
  });

  it("loads a cart saved in the old { id, qty } format", async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        state: { items: [{ id: "mist-trail-jacket", size: "M", qty: 2 }] },
        version: 0,
      }),
    );
    await useCart.persist.rehydrate();
    expect(useCart.getState().items).toEqual([
      { productId: "mist-trail-jacket", size: "M", quantity: 2 },
    ]);
  });
});

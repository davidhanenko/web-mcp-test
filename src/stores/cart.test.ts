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
    useCart.getState().addToCart("mist-trail-jacket", "M", "blue", 1);
    const cart = useCart.getState().getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      productId: "mist-trail-jacket",
      size: "M",
      color: "blue",
      quantity: 1,
    });
    expect(cart.total).toBe(128);
  });

  it("adds twice to the same item", () => {
    const { addToCart, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", "blue", 1);
    addToCart("mist-trail-jacket", "M", "blue", 1);
    const cart = getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.total).toBe(256);
  });

  it("keeps different colors of the same size as separate items", () => {
    const { addToCart, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", "blue", 1);
    addToCart("mist-trail-jacket", "M", "black", 1);
    expect(getCart().items).toHaveLength(2);
  });

  it("throws for an invalid color", () => {
    expect(() =>
      useCart.getState().addToCart("mist-trail-jacket", "M", "pink", 1),
    ).toThrow(/invalid color/i);
  });

  it("checks stock per color", () => {
    // Blue has 3 in M, so 4 in one color is too many even though the product has 8 in total.
    expect(() =>
      useCart.getState().addToCart("mist-trail-jacket", "M", "blue", 4),
    ).toThrow(/only 3 left/i);
  });

  it("throws for an invalid size", () => {
    expect(() =>
      useCart.getState().addToCart("mist-trail-jacket", "XXL", "blue", 1),
    ).toThrow(/invalid size/i);
  });

  it("throws when out of stock", () => {
    expect(() =>
      useCart.getState().addToCart("dusk-wind-shell", "M", "teal", 1),
    ).toThrow(/out of stock/i);
  });

  it("throws for an unknown product", () => {
    expect(() => useCart.getState().addToCart("nope", "M", "blue", 1)).toThrow(
      /unknown product/i,
    );
  });

  it("removes an item and updates the total", () => {
    const { addToCart, removeFromCart, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", "blue", 1);
    addToCart("merino-crew-socks", "S", "grey", 2);
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
    addToCart("mist-trail-jacket", "M", "blue", 1);
    setQuantity("mist-trail-jacket", "M", "blue", 3);
    const cart = getCart();
    expect(cart.items[0].quantity).toBe(3);
    expect(cart.total).toBe(128 * 3);
  });

  it("removes the item when set to 0", () => {
    const { addToCart, setQuantity, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", "blue", 2);
    setQuantity("mist-trail-jacket", "M", "blue", 0);
    expect(getCart().items).toHaveLength(0);
  });

  it("throws when the quantity exceeds stock", () => {
    const { addToCart, setQuantity } = useCart.getState();
    addToCart("mist-trail-jacket", "M", "blue", 1);
    expect(() => setQuantity("mist-trail-jacket", "M", "blue", 99)).toThrow(
      /only 3 left/i,
    );
  });

  it("throws for a negative or fractional quantity", () => {
    const { addToCart, setQuantity } = useCart.getState();
    addToCart("mist-trail-jacket", "M", "blue", 1);
    expect(() => setQuantity("mist-trail-jacket", "M", "blue", -1)).toThrow(
      /whole number/i,
    );
    expect(() => setQuantity("mist-trail-jacket", "M", "blue", 1.5)).toThrow(
      /whole number/i,
    );
  });

  it("throws for an unknown product or an item not in the cart", () => {
    const { setQuantity } = useCart.getState();
    expect(() => setQuantity("nope", "M", "blue", 1)).toThrow(/unknown product/i);
    expect(() => setQuantity("mist-trail-jacket", "M", "blue", 1)).toThrow(
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
      { productId: "mist-trail-jacket", size: "M", color: "blue", quantity: 2 },
    ]);
  });

  it("gives items saved without a color the product's first color", async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        state: {
          items: [
            { productId: "mist-trail-jacket", size: "M", quantity: 1 },
            { productId: "gone-product", size: "M", quantity: 1 },
          ],
        },
        version: 1,
      }),
    );
    await useCart.persist.rehydrate();
    expect(useCart.getState().items).toEqual([
      { productId: "mist-trail-jacket", size: "M", color: "blue", quantity: 1 },
    ]);
  });
});

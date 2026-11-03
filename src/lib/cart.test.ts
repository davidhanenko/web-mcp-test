import { beforeEach, describe, expect, it } from "vitest";
import { useCart } from "@/lib/cart";

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
      id: "mist-trail-jacket",
      size: "M",
      qty: 1,
    });
    expect(cart.total).toBe(128);
  });

  it("adds twice to the same line", () => {
    const { addToCart, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", 1);
    addToCart("mist-trail-jacket", "M", 1);
    const cart = getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(2);
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

  it("removes a line and updates the total", () => {
    const { addToCart, removeFromCart, getCart } = useCart.getState();
    addToCart("mist-trail-jacket", "M", 1);
    addToCart("merino-crew-socks", "S", 2);
    expect(getCart().total).toBe(128 + 36);
    removeFromCart("mist-trail-jacket", "M");
    const cart = getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].id).toBe("merino-crew-socks");
    expect(cart.total).toBe(36);
  });
});

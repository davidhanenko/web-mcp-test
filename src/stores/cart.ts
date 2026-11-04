"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  assertAvailable,
  assertProductExists,
  assertValidQuantity,
  findCartItem,
  getCartDetails,
} from "@/lib/cart";
import { getProduct } from "@/lib/catalog";
import type { CartDetails, CartItem, Size } from "@/lib/types";

export const CART_STORAGE_KEY = "northline-cart";

// Names and signatures of useCart and its actions are fixed by the spec
// (.cursor/rules/project.md) because the agent calls them via useCart.getState().
type CartState = {
  items: CartItem[];
  addToCart: (
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  setQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  getCart: () => CartDetails;
  clearCart: () => void;
};

type SavedCart = Pick<CartState, "items">;

function isSameItem(
  item: CartItem,
  productId: string,
  size: string,
  color: string,
) {
  return (
    item.productId === productId && item.size === size && item.color === color
  );
}

type SavedItemV0 = { id: string; size: Size; qty: number };
type SavedItemV1 = Omit<CartItem, "color">;

/**
 * Version 0 saved items as `{ id, size, qty }`, version 1 as `{ productId, size, quantity }`,
 * version 2 adds `color`. Each step upgrades one version, so old carts load in order.
 */
function migrateSavedCart(saved: unknown, version: number): SavedCart {
  let items = (saved as { items?: unknown[] } | undefined)?.items ?? [];

  if (version < 1) {
    items = (items as SavedItemV0[]).map(({ id, size, qty }) => ({
      productId: id,
      size,
      quantity: qty,
    }));
  }

  if (version < 2) {
    // Colors didn't exist yet: use the product's first color, and drop products that are gone.
    items = (items as SavedItemV1[]).flatMap((item) => {
      const color = getProduct(item.productId)?.colors[0];
      return color ? [{ ...item, color: color.id }] : [];
    });
  }

  return { items: items as CartItem[] };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart(productId, size, color, quantity) {
        assertValidQuantity(quantity);
        const alreadyInCart =
          findCartItem(get().items, productId, size, color)?.quantity ?? 0;
        const newQuantity = alreadyInCart + quantity;
        assertAvailable(productId, size, color, newQuantity);

        set((state) => {
          if (!findCartItem(state.items, productId, size, color)) {
            return {
              items: [...state.items, { productId, size, color, quantity }],
            };
          }
          return {
            items: state.items.map((item) =>
              isSameItem(item, productId, size, color)
                ? { ...item, quantity: newQuantity }
                : item,
            ),
          };
        });
      },

      /** Without `size` and `color`, removes the product in every size and color. */
      removeFromCart(productId, size, color) {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.productId !== productId ||
              (size !== undefined && item.size !== size) ||
              (color !== undefined && item.color !== color),
          ),
        }));
      },

      /** Quantity 0 removes the item. */
      setQuantity(productId, size, color, quantity) {
        assertValidQuantity(quantity, { allowZero: true });
        assertProductExists(productId);
        if (!findCartItem(get().items, productId, size, color)) {
          throw new Error(
            `${productId} in ${color}, size ${size} is not in the cart.`,
          );
        }
        if (quantity === 0) {
          get().removeFromCart(productId, size, color);
          return;
        }
        assertAvailable(productId, size, color, quantity);
        set((state) => ({
          items: state.items.map((item) =>
            isSameItem(item, productId, size, color)
              ? { ...item, quantity }
              : item,
          ),
        }));
      },

      getCart() {
        return getCartDetails(get().items);
      },

      clearCart() {
        set({ items: [] });
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Save only the items. Prices and names are looked up again on load.
      partialize: (state): SavedCart => ({ items: state.items }),
      version: 2,
      migrate: migrateSavedCart,
      // Don't load the saved cart on creation, so the browser's first render matches
      // the server's empty cart. SavedCartLoader loads it after React has hydrated.
      skipHydration: true,
    },
  ),
);

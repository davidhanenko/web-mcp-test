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
import type { CartDetails, CartItem, Size } from "@/lib/types";

export const CART_STORAGE_KEY = "northline-cart";

// Names and signatures of useCart and its actions are fixed by the spec
// (.cursor/rules/project.md) because the agent calls them via useCart.getState().
type CartState = {
  items: CartItem[];
  addToCart: (productId: string, size: string, quantity: number) => void;
  removeFromCart: (productId: string, size?: string) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  getCart: () => CartDetails;
  clearCart: () => void;
};

type SavedCart = Pick<CartState, "items">;

function isSameItem(item: CartItem, productId: string, size: string) {
  return item.productId === productId && item.size === size;
}

/** Version 0 saved items as `{ id, size, qty }`; version 1 as `{ productId, size, quantity }`. */
function migrateSavedCart(saved: unknown, version: number): SavedCart {
  if (version === 0) {
    const old = (saved as { items?: { id: string; size: Size; qty: number }[] })
      .items;
    return {
      items: (old ?? []).map(({ id, size, qty }) => ({
        productId: id,
        size,
        quantity: qty,
      })),
    };
  }
  return saved as SavedCart;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart(productId, size, quantity) {
        assertValidQuantity(quantity);
        const alreadyInCart =
          findCartItem(get().items, productId, size)?.quantity ?? 0;
        const newQuantity = alreadyInCart + quantity;
        assertAvailable(productId, size, newQuantity);

        set((state) => {
          if (!findCartItem(state.items, productId, size)) {
            return {
              items: [...state.items, { productId, size, quantity }],
            };
          }
          return {
            items: state.items.map((item) =>
              isSameItem(item, productId, size)
                ? { ...item, quantity: newQuantity }
                : item,
            ),
          };
        });
      },

      /** Without `size`, removes the product in every size. */
      removeFromCart(productId, size) {
        set((state) => ({
          items: state.items.filter((item) => {
            if (item.productId !== productId) return true;
            if (size === undefined) return false;
            return item.size !== size;
          }),
        }));
      },

      /** Quantity 0 removes the item. */
      setQuantity(productId, size, quantity) {
        assertValidQuantity(quantity, { allowZero: true });
        assertProductExists(productId);
        if (!findCartItem(get().items, productId, size)) {
          throw new Error(`${productId} in size ${size} is not in the cart.`);
        }
        if (quantity === 0) {
          get().removeFromCart(productId, size);
          return;
        }
        assertAvailable(productId, size, quantity);
        set((state) => ({
          items: state.items.map((item) =>
            isSameItem(item, productId, size) ? { ...item, quantity } : item,
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
      version: 1,
      migrate: migrateSavedCart,
      // Don't load the saved cart on creation, so the browser's first render matches
      // the server's empty cart. SavedCartLoader loads it after React has hydrated.
      skipHydration: true,
    },
  ),
);

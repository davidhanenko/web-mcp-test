"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProduct } from "@/lib/catalog";
import type { CartLine, CartView, Size } from "@/lib/types";
import { SIZES } from "@/lib/types";

export const CART_STORAGE_KEY = "northline-cart";

type CartState = {
  items: CartLine[];
  addToCart: (id: string, size: string, qty: number) => void;
  removeFromCart: (id: string, size?: string) => void;
  getCart: () => CartView;
  clearCart: () => void;
};

function isSize(value: string): value is Size {
  return (SIZES as readonly string[]).includes(value);
}

function viewFromItems(items: CartLine[]): CartView {
  const viewItems = items.map((line) => {
    const product = getProduct(line.id);
    const price = product?.price ?? 0;
    return {
      ...line,
      name: product?.name ?? line.id,
      price,
      image: product?.image ?? "",
      lineTotal: price * line.qty,
    };
  });

  return {
    items: viewItems,
    total: viewItems.reduce((sum, line) => sum + line.lineTotal, 0),
  };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart(id, size, qty) {
        if (!Number.isInteger(qty) || qty < 1) {
          throw new Error("Quantity must be a positive whole number.");
        }

        const product = getProduct(id);
        if (!product) {
          throw new Error(`Unknown product: ${id}`);
        }

        if (!isSize(size) || !product.sizes.includes(size)) {
          throw new Error(`Invalid size ${size} for ${product.name}.`);
        }

        const available = product.stock[size] ?? 0;
        const currentQty =
          get().items.find((line) => line.id === id && line.size === size)?.qty ??
          0;
        const nextQty = currentQty + qty;

        if (available <= 0) {
          throw new Error(`${product.name} in size ${size} is out of stock.`);
        }

        if (nextQty > available) {
          throw new Error(
            `Only ${available} left in size ${size} for ${product.name}.`,
          );
        }

        set((state) => {
          const existing = state.items.findIndex(
            (line) => line.id === id && line.size === size,
          );
          if (existing === -1) {
            return { items: [...state.items, { id, size, qty }] };
          }
          const items = state.items.map((line, index) =>
            index === existing ? { ...line, qty: nextQty } : line,
          );
          return { items };
        });
      },
      removeFromCart(id, size) {
        set((state) => ({
          items: state.items.filter((line) => {
            if (line.id !== id) return true;
            if (size === undefined) return false;
            return line.size !== size;
          }),
        }));
      },
      getCart() {
        return viewFromItems(get().items);
      },
      clearCart() {
        set({ items: [] });
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);

"use client";

import { create } from "zustand";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";
import { saveLastOrder } from "@/webmcp/test-flags";

type OrderState = {
  placed: boolean;
  placeOrder: () => void | { error: string };
  reset: () => void;
};

export const useOrder = create<OrderState>((set) => ({
  placed: false,
  placeOrder: () => {
    const items = useCart.getState().items;
    if (items.length === 0) return { error: "Cart is empty." };
    saveLastOrder(items);
    useCart.getState().clearCart();
    useCartDrawer.getState().close();
    set({ placed: true });
  },
  reset: () => set({ placed: false }),
}));

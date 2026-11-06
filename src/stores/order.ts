"use client";

import { create } from "zustand";
import type { CartDetails } from "@/lib/types";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";
import { saveLastOrder } from "@/webmcp/test-flags";

type OrderState = {
  /** The last order placed in this tab, shown on the confirmation page. Kept in memory only. */
  lastOrder: CartDetails | null;
  placeOrder: () => void | { error: string };
};

export const useOrder = create<OrderState>((set) => ({
  lastOrder: null,
  placeOrder: () => {
    const cart = useCart.getState().getCart();
    if (cart.items.length === 0) return { error: "Cart is empty." };
    saveLastOrder(useCart.getState().items);
    useCart.getState().clearCart();
    useCartDrawer.getState().close();
    set({ lastOrder: cart });
  },
}));

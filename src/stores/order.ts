"use client";

import { create } from "zustand";
import { payTotal, promoDiscount } from "@/lib/promo";
import type { CartDetails } from "@/lib/types";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";
import { readAppliedCode } from "@/stores/marketing";
import { saveLastOrder } from "@/webmcp/test-flags";

// List-price cart plus the checkout promo, if one was applied.
export type PlacedOrder = CartDetails & {
  discount: number;
  payTotal: number;
};

type OrderState = {
  // The last order placed in this tab, shown on the confirmation page.
  // Kept in memory only.
  lastOrder: PlacedOrder | null;
  placeOrder: () => void | { error: string };
};

export const useOrder = create<OrderState>((set) => ({
  lastOrder: null,
  placeOrder: () => {
    const cart = useCart.getState().getCart();
    if (cart.items.length === 0) return { error: "Cart is empty." };
    saveLastOrder(useCart.getState().items);
    const discount = promoDiscount(cart.items, readAppliedCode());
    useCart.getState().clearCart();
    useCartDrawer.getState().close();
    set({
      lastOrder: {
        ...cart,
        discount,
        payTotal: payTotal(cart.total, discount),
      },
    });
  },
}));

"use client";

import { useSyncExternalStore } from "react";
import { useCart } from "@/stores/cart";

/**
 * False until the saved cart has been loaded from localStorage (see SavedCartLoader).
 * Use it to tell "still loading" apart from "the cart is really empty".
 */
export function useIsSavedCartLoaded(): boolean {
  return useSyncExternalStore(
    (onChange) => useCart.persist.onFinishHydration(onChange),
    () => useCart.persist.hasHydrated(),
    () => false, // on the server nothing is ever loaded
  );
}

"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";

/**
 * Loads the saved cart from localStorage once, after React has hydrated the page.
 * The store skips this on creation (`skipHydration`) so the first render matches the server.
 */
export function SavedCartLoader() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  return null;
}

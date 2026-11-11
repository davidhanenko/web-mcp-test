"use client";

import { useMemo } from "react";
import { getCartDetails } from "@/lib/cart";
import type { CartDetails } from "@/lib/types";
import { useCart } from "@/stores/cart";

// Re-renders only when the cart items change.
export function useCartDetails(): CartDetails {
  // Subscribe to the stored items: the array keeps the same reference until an
  // action changes it. Don't select `s.getCart()`: it returns a new object on
  // every call, so Zustand would see a change on every render and loop forever.
  const items = useCart((s) => s.items);

  // Look prices up once per change of items, not on every render.
  return useMemo(() => getCartDetails(items), [items]);
}

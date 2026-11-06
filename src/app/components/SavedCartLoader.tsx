"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";


export function SavedCartLoader() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  return null;
}

"use client";

import { useEffect, useState } from "react";

const STOCK_LOAD_MS = 700;

// Page-only delay; tools and cart checks read stock at once.
export function useStockLoad(colorId: string): boolean {
  const [loadedFor, setLoadedFor] = useState("");

  useEffect(() => {
    if (!colorId) return;
    const timer = window.setTimeout(() => setLoadedFor(colorId), STOCK_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [colorId]);

  return colorId !== "" && loadedFor !== colorId;
}

"use client";

import { useEffect, useState } from "react";

const STOCK_LOAD_MS = 700;

/**
 * Page-only delay: after a color is chosen, stock "loads" for a moment, like a store that
 * asks its server. It does not touch the catalog, so tools and cart checks still read
 * stock at once.
 */
export function useStockLoad(colorId: string): boolean {
  const [loadedFor, setLoadedFor] = useState("");

  useEffect(() => {
    if (!colorId) return;
    const timer = window.setTimeout(() => setLoadedFor(colorId), STOCK_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [colorId]);

  return colorId !== "" && loadedFor !== colorId;
}

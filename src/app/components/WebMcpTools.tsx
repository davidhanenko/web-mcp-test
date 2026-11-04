"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIsSavedCartLoaded } from "@/hooks/useIsSavedCartLoaded";
import { useCartDrawer } from "@/stores/cart-drawer";
import { createTools } from "@/webmcp/tools";

/**
 * Registers the store's WebMCP tools with the browser. Renders nothing.
 * Does nothing in browsers without WebMCP. Waits for the saved cart, so the agent
 * never sees an empty cart that is only still loading.
 */
export function WebMcpTools() {
  const router = useRouter();
  const isSavedCartLoaded = useIsSavedCartLoaded();

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext || !isSavedCartLoaded) return;

    const tools = createTools({
      openCheckout: () => {
        useCartDrawer.getState().close();
        router.push("/checkout");
      },
    });

    // One signal for all tools: aborting it unregisters every one of them.
    const controller = new AbortController();
    const { signal } = controller;

    // All or none: if any tool fails to register, unregister the others too.
    // `async` turns an error thrown right away into a rejection, so it's caught here as well.
    Promise.all(
      tools.map(async (tool) => modelContext.registerTool(tool, { signal })),
    ).catch((error: unknown) => {
      controller.abort();
      console.error("WebMCP tools were not registered:", error);
    });

    return () => controller.abort();
  }, [router, isSavedCartLoaded]);

  return null;
}

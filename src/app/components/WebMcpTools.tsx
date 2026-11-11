"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIsSavedCartLoaded } from "@/hooks/useIsSavedCartLoaded";
import { useCartDrawer } from "@/stores/cart-drawer";
import { createTools } from "@/webmcp/tools";
import { useToolsMode } from "@/webmcp/tools-mode";

export function WebMcpTools() {
  const router = useRouter();
  const isSavedCartLoaded = useIsSavedCartLoaded();
  const toolsMode = useToolsMode();

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext || !isSavedCartLoaded) return;
    if (toolsMode === null || toolsMode === "off") return;

    const tools = createTools({
      navigate: (path) => router.push(path),
      openDrawer: () => useCartDrawer.getState().open(),
      closeDrawer: () => useCartDrawer.getState().close(),
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
  }, [router, isSavedCartLoaded, toolsMode]);

  return null;
}

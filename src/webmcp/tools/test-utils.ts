import { vi } from "vitest";
import { useAgentCartChanges } from "@/stores/agent-cart-changes";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";
import { useCatalogFilters } from "@/stores/catalog-filters";
import { resetPopups } from "@/stores/marketing";
import type { ToolPage } from "@/webmcp/page";
import { createTools } from "@/webmcp/tools";

// Chrome's limit for one tool's result, in characters.
export const MAX_RESULT_LENGTH = 1500;

export const page = {
  navigate: vi.fn<ToolPage["navigate"]>(),
  openDrawer: vi.fn<ToolPage["openDrawer"]>(),
  closeDrawer: vi.fn<ToolPage["closeDrawer"]>(),
};

export const tools = createTools(page);
const client = { signal: new AbortController().signal };

/** Calls a tool the way the browser does. */
export async function run(
  name: string,
  input: ModelContextToolInput = {},
): Promise<Record<string, unknown>> {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`No tool named ${name}`);
  return (await tool.execute(input, client)) as Record<string, unknown>;
}

export function resultLength(result: unknown): number {
  return JSON.stringify(result).length;
}

export function resetStores(): void {
  localStorage.clear();
  useCart.setState({ items: [] });
  useCartDrawer.setState({ isOpen: false });
  useCatalogFilters.getState().clearAll();
  useAgentCartChanges.setState({ count: 0, countAtCheckoutOpen: 0 });
  resetPopups();
  page.navigate.mockClear();
  page.openDrawer.mockClear();
  page.closeDrawer.mockClear();
}

/** Ten in-stock items with long names: the biggest cart the result size tests use. */
export const LARGE_CART = [
  { productId: "granite-insulated-jacket", color: "grey", size: "XS", quantity: 1 },
  { productId: "lightweight-liner-socks", color: "black", size: "XS", quantity: 1 },
  { productId: "peak-compression-socks", color: "blue", size: "XS", quantity: 1 },
  { productId: "brook-packable-shell", color: "red", size: "XS", quantity: 1 },
  { productId: "cedar-flannel-shirt", color: "red", size: "XS", quantity: 1 },
  { productId: "alpine-winter-boots", color: "black", size: "8", quantity: 1 },
  { productId: "ember-down-jacket", color: "rust", size: "XS", quantity: 1 },
  { productId: "merino-base-shirt", color: "black", size: "XS", quantity: 1 },
  { productId: "summit-ski-socks", color: "navy", size: "XS", quantity: 1 },
  { productId: "camp-henley-shirt", color: "olive", size: "XS", quantity: 1 },
];

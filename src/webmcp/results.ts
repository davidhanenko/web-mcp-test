import { hasStock } from "@/lib/catalog";
import { payTotal, promoDiscount } from "@/lib/promo";
import type { Product, Size } from "@/lib/types";
import { useCart } from "@/stores/cart";
import { readAppliedCode } from "@/stores/marketing";
import { ToolError } from "@/webmcp/input";

export function cartForAgent() {
  const { items, total, totalQuantity } = useCart.getState().getCart();
  const appliedCode = readAppliedCode();
  const discount = promoDiscount(items, appliedCode);
  return {
    items: items.map(({ productId, name, size, color, quantity, unitPrice }) => ({
      productId,
      name,
      size,
      color,
      quantity,
      unitPrice,
    })),
    total,
    totalQuantity,
    appliedCode: appliedCode || null,
    discount,
    payTotal: payTotal(total, discount),
  };
}

export function sizesInStock(product: Product): Size[] {
  return product.sizes.filter((size) => hasStock(product, size));
}

export function inStockByColor(product: Product): Record<string, Size[]> {
  return Object.fromEntries(
    product.colors.map((color) => [
      color.id,
      product.sizes.filter((size) => hasStock(product, size, color.id)),
    ]),
  );
}

export function stockBySize(
  product: Product,
  stock: Partial<Record<Size, number>>,
): Record<string, number> {
  return Object.fromEntries(product.sizes.map((size) => [size, stock[size] ?? 0]));
}

// A thrown error never reaches the agent, so it becomes the result instead.
export function errorResult(error: unknown): Record<string, unknown> {
  if (error instanceof ToolError) return { error: error.message, ...error.data };
  return {
    error: error instanceof Error ? error.message : "The tool failed unexpectedly.",
  };
}

export function withErrorResults(tool: ModelContextTool): ModelContextTool {
  return {
    ...tool,
    async execute(input, client) {
      try {
        return await tool.execute(input ?? {}, client);
      } catch (error) {
        return errorResult(error);
      }
    },
  };
}

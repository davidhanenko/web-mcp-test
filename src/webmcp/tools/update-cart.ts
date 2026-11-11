import { assertAvailable, findCartItem } from "@/lib/cart";
import { getProduct } from "@/lib/catalog";
import type { Size } from "@/lib/types";
import { useAgentCartChanges } from "@/stores/agent-cart-changes";
import { useCart } from "@/stores/cart";
import {
  requireColorFor,
  requireProduct,
  requireSizeFor,
  ToolError,
  wholeNumber,
} from "@/webmcp/input";
import type { ToolPage } from "@/webmcp/page";
import { cartForAgent, inStockByColor } from "@/webmcp/results";

const MAX_ITEMS = 10;

type Change = {
  productId: string;
  size: Size;
  color: string;
  /** Units in the cart before this call. */
  from: number;
  /** Units the agent asked for. */
  to: number;
};

export function updateCartTool(page: ToolPage): ModelContextTool {
  return {
    name: "update_cart",
    description: `Set how many units of each item the cart holds: 1 to ${MAX_ITEMS} items, each with productId, color, size and quantity. quantity is the final count, not an amount to add; 0 removes the item. Calling it again with the same items changes nothing. If any item fails, nothing changes. Returns the updated cart.`,
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          minItems: 1,
          maxItems: MAX_ITEMS,
          description:
            "The items to set. To change a size, set the old size to 0 and the new one to 1.",
          items: {
            type: "object",
            properties: {
              productId: {
                type: "string",
                description: "Product id from search_products.",
              },
              color: {
                type: "string",
                description: "Color id from get_product, e.g. black.",
              },
              size: {
                type: "string",
                description: "One of the product's sizes, e.g. M or 10.",
              },
              quantity: {
                type: "integer",
                minimum: 0,
                description: "Units the cart should hold. 0 removes the item.",
              },
            },
            required: ["productId", "color", "size", "quantity"],
          },
        },
      },
      required: ["items"],
    },
    execute(input) {
      const entries = input.items;
      if (
        !Array.isArray(entries) ||
        entries.length === 0 ||
        entries.length > MAX_ITEMS
      ) {
        throw new ToolError(
          `items must be a list of 1 to ${MAX_ITEMS} items, each with productId, color, size and quantity.`,
        );
      }

      // Check every item before changing anything.
      const current = useCart.getState().items;
      const seen = new Set<string>();
      const changes = entries.map((entry: unknown, index): Change => {
        const item = (entry ?? {}) as Record<string, unknown>;
        try {
          const product = requireProduct(item.productId);
          const size = requireSizeFor(product, item.size);
          const color = requireColorFor(product, item.color).id;
          const to = wholeNumber(item.quantity, "quantity", 0);
          if (to > 0) assertAvailable(product.id, size, color, to);

          const key = `${product.id}|${color}|${size}`;
          if (seen.has(key)) {
            throw new ToolError(
              `${product.name} in ${color}, size ${size} is listed twice. List each item once.`,
            );
          }
          seen.add(key);

          const from =
            findCartItem(current, product.id, size, color)?.quantity ?? 0;
          return { productId: product.id, size, color, from, to };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Invalid item.";
          const product =
            typeof item.productId === "string"
              ? getProduct(item.productId)
              : undefined;
          throw new ToolError(`Item ${index + 1}: ${message} Nothing was changed.`, {
            itemIndex: index,
            ...(product
              ? { sizes: product.sizes, inStockByColor: inStockByColor(product) }
              : {}),
          });
        }
      });

      const cart = useCart.getState();
      const changed = changes.filter((change) => change.to !== change.from);
      for (const { productId, size, color, from, to } of changed) {
        if (to === 0) cart.removeFromCart(productId, size, color);
        else if (from > 0) cart.setQuantity(productId, size, color, to);
        else cart.addToCart(productId, size, color, to);
      }

      if (changed.length > 0) useAgentCartChanges.getState().recordChange();
      if (changed.some((change) => change.to > change.from)) page.openDrawer();

      // A count, not a list: the cart already shows every quantity, and a list
      // could push the result past Chrome's size limit.
      return { changedItems: changed.length, cart: cartForAgent() };
    },
  };
}

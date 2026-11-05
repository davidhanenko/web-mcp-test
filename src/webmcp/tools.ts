import { getProduct, getStock, hasStock, searchProducts } from "@/lib/catalog";
import { findCartItem } from "@/lib/cart";
import {
  CATEGORIES,
  SIZES,
  type Category,
  type Product,
  type Size,
} from "@/lib/types";
import { useCart } from "@/stores/cart";
import { withInjection } from "@/webmcp/test-flags";

// Keeps the result under Chrome's 1.5K-character limit per tool result.
const MAX_SEARCH_RESULTS = 10;

type SearchInput = {
  query?: string | null;
  category?: Category | null;
  maxPrice?: number | null;
  size?: Size | null;
};
type CartItemInput ={ productId: string; size: string; color: string };
type AddToCartInput = CartItemInput & { quantity?: number | null };

const cartItemProperties = {
  productId: {
    type: "string",
    description: "Product id from search_products or get_product.",
  },
  size: { type: "string", enum: SIZES, description: "Size, e.g. M." },
  color: {
    type: "string",
    description: "Color id from get_product, e.g. blue.",
  },
};

export function createTools({
  openCheckout,
}: {
  openCheckout: () => void;
}): ModelContextTool[] {
  return [
    {
      name: "search_products",
      description: `Search the store catalog by text, category, maximum price in USD or size. Returns up to ${MAX_SEARCH_RESULTS} products with productId, name, price and the sizes in stock. Use it to find product ids.`,
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Words matched against name, description, tags, colors.",
          },
          category: { type: "string", enum: CATEGORIES },
          maxPrice: { type: "number", description: "Highest price in USD." },
          size: { type: "string", enum: SIZES },
        },
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) {
        const { query, category, maxPrice, size } = input as SearchInput;

        // The browser doesn't check input against inputSchema, and searchProducts doesn't either.
        // Agents often send null or "" for filters they don't use, so falsy means "not given".
        if (query && typeof query !== "string") {
          return { error: "query must be text." };
        }
        if (category && !isOneOf(category, CATEGORIES)) {
          return {
            error: `Unknown category: ${category}. Use one of: ${CATEGORIES.join(", ")}.`,
          };
        }
        if (maxPrice && typeof maxPrice !== "number") {
          return { error: "maxPrice must be a number in USD." };
        }
        if (size && !isOneOf(size, SIZES)) {
          return {
            error: `Unknown size: ${size}. Use one of: ${SIZES.join(", ")}.`,
          };
        }

        const matches = searchProducts({
          query: query || undefined,
          category: category || undefined,
          maxPrice: maxPrice || undefined,
          size: size || undefined,
        });
        return {
          totalMatches: matches.length,
          products: matches.slice(0, MAX_SEARCH_RESULTS).map((product) => ({
            productId: product.id,
            name: product.name,
            price: product.price,
            sizesInStock: getSizesInStock(product),
          })),
        };
      },
    },

    {
      name: "get_product",
      description:
        "Get one product's description and its stock for every color and size. Use it to choose a size and color before adding to the cart.",
      inputSchema: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "Product id from search_products.",
          },
        },
        required: ["productId"],
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) {
        const { productId } = input as { productId: string };
        const product = getProduct(productId);
        if (!product) return { error: `Unknown product: ${productId}` };

        return {
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          description: withInjection(product.id, product.description),
          colors: product.colors.map((color) => ({
            id: color.id,
            name: color.name,
            stock: Object.fromEntries(
              product.sizes.map((size) => [
                size,
                getStock(product, color.id, size),
              ]),
            ),
          })),
        };
      },
    },

    {
      name: "get_cart",
      description:
        "Read the cart: every item with product id, name, size, color, quantity and unit price, plus the total in USD.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute() {
        return getCartForAgent();
      },
    },

    {
      name: "add_to_cart",
      description:
        "Add one product in one size and color to the cart. Use a product id from search_products or get_product. Returns the updated cart.",
      inputSchema: {
        type: "object",
        properties: {
          ...cartItemProperties,
          quantity: {
            type: "integer",
            minimum: 1,
            description: "How many to add. Defaults to 1.",
          },
        },
        required: ["productId", "size", "color"],
      },
      execute(input) {
        const { productId, size, color, quantity } = input as AddToCartInput;
        try {
          useCart.getState().addToCart(productId, size, color, quantity ?? 1);
        } catch (error) {
          // A thrown error's message never reaches the agent, so return it.
          const message =
            error instanceof Error ? error.message : "The tool failed unexpectedly.";
          const product = getProduct(productId);
          if (!product) return { error: message };
          // What's in stock, so the agent can retry.
          return { error: message, inStock: getSizesInStockByColor(product) };
        }
        return getCartForAgent();
      },
    },

    {
      name: "remove_from_cart",
      description:
        "Remove one item from the cart, identified by product id, size and color. Returns the updated cart.",
      inputSchema: {
        type: "object",
        properties: cartItemProperties,
        required: ["productId", "size", "color"],
      },
      execute(input) {
        const { productId, size, color } = input as CartItemInput;
        // removeFromCart doesn't fail for a missing item, and without size or color it removes them all.
        if (!findCartItem(useCart.getState().items, productId, size, color)) {
          return {
            error: `${productId} in ${color}, size ${size} is not in the cart.`,
          };
        }
        useCart.getState().removeFromCart(productId, size, color);
        return getCartForAgent();
      },
    },

    {
      name: "open_checkout",
      description:
        "Open the checkout review page, which shows the cart and total. It does not place the order; the customer places it.",
      inputSchema: { type: "object", properties: {} },
      annotations: { consequentialHint: true },
      execute() {
        openCheckout();
        return "Checkout review is open. The customer places the order.";
      },
    },
  ];
}

function getCartForAgent() {
  const { items, total, totalQuantity } = useCart.getState().getCart();
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
  };
}

function getSizesInStock(product: Product): Size[] {
  return product.sizes.filter((size) => hasStock(product, size));
}

function getSizesInStockByColor(product: Product): Record<string, Size[]> {
  return Object.fromEntries(
    product.colors.map((color) => [
      color.id,
      product.sizes.filter((size) => hasStock(product, size, color.id)),
    ]),
  );
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly unknown[]).includes(value);
}

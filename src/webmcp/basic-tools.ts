// The baseline for the basic vs adapted comparison. Names, descriptions, input schemas
// and annotations are copied from tools.ts; only `execute` differs. Each one calls the
// existing function with the input as it comes and returns its result as it is.
// No input checks, no null handling, no try/catch: that is on purpose. Don't "fix" it.
import { getProduct, searchProducts } from "@/lib/catalog";
import { CATEGORIES, SIZES, type SearchFilters } from "@/lib/types";
import { useCart } from "@/stores/cart";

// Same value as in tools.ts, so the descriptions match.
const MAX_SEARCH_RESULTS = 10;

type CartItemInput = { productId: string; size: string; color: string };
type AddToCartInput = CartItemInput & { quantity: number };

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

export function createBasicTools({
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
        return searchProducts(input as SearchFilters);
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
        return getProduct((input as { productId: string }).productId);
      },
    },

    {
      name: "get_cart",
      description:
        "Read the cart: every item with product id, name, size, color, quantity and unit price, plus the total in USD.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute() {
        return useCart.getState().getCart();
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
        useCart.getState().addToCart(productId, size, color, quantity);
        return "OK";
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
        useCart.getState().removeFromCart(productId, size, color);
        return "OK";
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
        return "OK";
      },
    },
  ];
}

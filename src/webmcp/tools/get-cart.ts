import { cartForAgent } from "@/webmcp/results";

export function getCartTool(): ModelContextTool {
  return {
    name: "get_cart",
    description:
      "Read the cart: every item with product id, name, size, color, quantity and unit price, the list total, the applied promo code, the discount and the total to pay, in USD.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    execute() {
      return cartForAgent();
    },
  };
}

import { ToolError } from "@/webmcp/input";
import type { ToolPage } from "@/webmcp/page";
import { cartForAgent } from "@/webmcp/results";

export const CHECKOUT_HANDOFF =
  "Stop here. The customer enters contact, shipping and payment details and clicks Pay now. Do not fill in these fields.";

export function openCheckoutTool(page: ToolPage): ModelContextTool {
  return {
    name: "open_checkout",
    description:
      "Open the checkout page and hand it to the customer, who enters contact, shipping and payment details and pays. Returns the items, the discount and the total to pay shown there. The agent does not fill in checkout.",
    inputSchema: { type: "object", properties: {} },
    execute() {
      const cart = cartForAgent();
      if (cart.items.length === 0) {
        throw new ToolError(
          "The cart is empty. Add products with update_cart first.",
        );
      }
      page.closeDrawer();
      page.navigate("/checkout");
      return { ...cart, handoff: CHECKOUT_HANDOFF };
    },
  };
}

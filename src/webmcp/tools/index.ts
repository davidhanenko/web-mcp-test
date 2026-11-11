import type { ToolPage } from "@/webmcp/page";
import { withErrorResults } from "@/webmcp/results";
import { applyPromoCodeTool } from "./apply-promo-code";
import { getCartTool } from "./get-cart";
import { getOffersTool } from "./get-offers";
import { getProductDetailsTool } from "./get-product-details";
import { getProductTool } from "./get-product";
import { openCheckoutTool } from "./open-checkout";
import { searchProductsTool } from "./search-products";
import { updateCartTool } from "./update-cart";

// contact_support is a form tool, so it is not listed here.
export function createTools(page: ToolPage): ModelContextTool[] {
  return [
    searchProductsTool(page),
    getProductTool(page),
    getProductDetailsTool(),
    getOffersTool(),
    getCartTool(),
    updateCartTool(page),
    applyPromoCodeTool(),
    openCheckoutTool(page),
  ].map(withErrorResults);
}

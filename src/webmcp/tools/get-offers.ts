import { getOffers } from "@/lib/promo";

export function getOffersTool(): ModelContextTool {
  return {
    name: "get_offers",
    description:
      "List the running promo codes: the product each one is for, its list price, the amount off and the price with the code. Codes apply at checkout; use apply_promo_code to apply one.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    execute() {
      return { offers: getOffers() };
    },
  };
}

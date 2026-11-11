import { getProduct } from "@/lib/catalog";
import {
  normalizePromoCode,
  PROMO_AMOUNT,
  PROMO_CODE,
  PROMO_PRODUCT_ID,
} from "@/lib/promo";
import { saveAppliedCode } from "@/stores/marketing";
import { ToolError } from "@/webmcp/input";
import { cartForAgent } from "@/webmcp/results";

export function applyPromoCodeTool(): ModelContextTool {
  return {
    name: "apply_promo_code",
    description:
      "Apply a promo code to the order, as the checkout's code field does. An empty code removes the applied one. Returns the code, the discount and the total to pay. Get codes from get_offers.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description:
            "The promo code, e.g. from get_offers. An empty string removes the code.",
        },
      },
      required: ["code"],
    },
    execute(input) {
      const raw = input.code ?? "";
      if (typeof raw !== "string") throw new ToolError("code must be text.");
      const code = normalizePromoCode(raw);

      if (code && code !== PROMO_CODE) {
        throw new ToolError(
          `${code} is not a valid code. See get_offers for the running offers.`,
        );
      }
      // The same saved code the checkout reads, so it opens with the code applied.
      saveAppliedCode(code);

      const { appliedCode, discount, payTotal } = cartForAgent();
      const productName = getProduct(PROMO_PRODUCT_ID)?.name ?? PROMO_PRODUCT_ID;
      return {
        appliedCode,
        discount,
        payTotal,
        ...(code && discount === 0
          ? {
              note: `${PROMO_CODE} takes $${PROMO_AMOUNT} off each ${productName}. None is in the cart, so the discount is $0.`,
            }
          : {}),
      };
    },
  };
}

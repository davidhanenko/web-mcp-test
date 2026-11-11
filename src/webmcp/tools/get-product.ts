import { getSimilarInSize, getStock } from "@/lib/catalog";
import { getProductDetails } from "@/lib/product-details";
import { getOfferFor } from "@/lib/promo";
import { ALL_SIZES } from "@/lib/types";
import { isGiven, requireProduct, requireSizeFor } from "@/webmcp/input";
import type { ToolPage } from "@/webmcp/page";
import { stockBySize } from "@/webmcp/results";
import { withInjection } from "@/webmcp/test-flags";

// Same as the page's similar products next to a sold-out size.
const SIMILAR_COUNT = 3;

export function getProductTool(page: ToolPage): ModelContextTool {
  return {
    name: "get_product",
    description:
      "Get one product: description, price, fit, rating, its sizes, and units in stock for every color and size. With size, also lists the colors in stock in that size and up to 3 similar products in stock in it. Shows any promo price. Opens the product page.",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "Product id from search_products.",
        },
        size: {
          type: "string",
          enum: ALL_SIZES,
          description: "Optional. The size the customer wants, to find colors and alternatives in it.",
        },
      },
      required: ["productId"],
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute(input) {
      const product = requireProduct(input.productId);
      const size = isGiven(input.size) ? requireSizeFor(product, input.size) : undefined;
      const details = getProductDetails(product.id);
      const offer = getOfferFor(product.id);

      page.closeDrawer();
      page.navigate(`/products/${product.id}`);

      return {
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: withInjection(product.id, product.description),
        fit: details?.fit ?? null,
        rating: details?.rating ?? null,
        reviewCount: details?.reviewCount ?? 0,
        sizes: product.sizes,
        colors: product.colors.map((color) => ({
          id: color.id,
          name: color.name,
          stock: stockBySize(product, color.stock),
        })),
        ...(offer
          ? { offer: { code: offer.code, priceWithCode: offer.priceWithCode } }
          : {}),
        ...(size
          ? {
              forSize: {
                size,
                colorsInStock: product.colors
                  .filter((color) => getStock(product, color.id, size) > 0)
                  .map((color) => color.id),
                similarInStock: getSimilarInSize(product, size, SIMILAR_COUNT).map(
                  (similar) => ({
                    productId: similar.id,
                    name: similar.name,
                    price: similar.price,
                  }),
                ),
              },
            }
          : {}),
      };
    },
  };
}

import { getProductDetails } from "@/lib/product-details";
import { getSizeChart } from "@/lib/size-chart";
import { requireProduct } from "@/webmcp/input";

export function getProductDetailsTool(): ModelContextTool {
  return {
    name: "get_product_details",
    description:
      "Get a product's specs, fit note, customer reviews and size chart (inches for apparel, foot length for boots, shoe size for socks). Use it to choose a size or compare products.",
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
    // Reviews are written by customers.
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute(input) {
      const product = requireProduct(input.productId);
      const details = getProductDetails(product.id);
      const chart = getSizeChart(product.category);
      return {
        productId: product.id,
        fit: details?.fit ?? null,
        specs: details?.specs ?? [],
        reviews: (details?.reviews ?? []).map(({ title, text }) => ({ title, text })),
        sizeChart: { title: chart.title, columns: chart.columns, rows: chart.rows },
      };
    },
  };
}

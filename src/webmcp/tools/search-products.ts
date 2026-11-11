import {
  CATALOG_PAGE_SIZE,
  getPage,
  getPageCount,
  searchProducts,
  sortProducts,
  SORTS,
} from "@/lib/catalog";
import { ALL_SIZES, CATEGORIES } from "@/lib/types";
import { useCatalogFilters } from "@/stores/catalog-filters";
import {
  optionalOneOf,
  optionalPrice,
  optionalSize,
  optionalText,
  optionalWholeNumber,
  ToolError,
} from "@/webmcp/input";
import type { ToolPage } from "@/webmcp/page";
import { sizesInStock } from "@/webmcp/results";

export function searchProductsTool(page: ToolPage): ModelContextTool {
  return {
    name: "search_products",
    description: `Search the catalog by words, category, maximum price in USD and size, sorted like the shop. Returns one page of ${CATALOG_PAGE_SIZE} products with productId, name, category, price and the sizes in stock, plus totalMatches and pageCount. The shop page shows the same results.`,
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Words matched against name, description, tags, colors and category.",
        },
        category: { type: "string", enum: CATEGORIES },
        maxPrice: { type: "number", description: "Highest price in USD." },
        size: {
          type: "string",
          enum: ALL_SIZES,
          description: "XS–XL for jackets, shirts and socks. US 8–12 for boots.",
        },
        sort: {
          type: "string",
          enum: SORTS,
          description: "featured (default), price-asc, price-desc or name.",
        },
        page: { type: "integer", minimum: 1, description: "Page number, from 1. Defaults to 1." },
      },
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute(input) {
      const query = optionalText(input.query, "query");
      const category = optionalOneOf(input.category, CATEGORIES, "category");
      const maxPrice = optionalPrice(input.maxPrice, "maxPrice");
      const size = optionalSize(input.size);
      const sort = optionalOneOf(input.sort, SORTS, "sort") ?? "featured";
      const pageNumber = optionalWholeNumber(input.page, "page", 1) ?? 1;

      const matches = sortProducts(
        searchProducts({ query, category, maxPrice, size }),
        sort,
      );
      const pageCount = getPageCount(matches.length);
      if (pageNumber > pageCount) {
        throw new ToolError(`There is no page ${pageNumber}. The last page is ${pageCount}.`, {
          totalMatches: matches.length,
          pageCount,
        });
      }

      useCatalogFilters
        .getState()
        .applyFromSearch({ query, category, maxPrice, size, sort, page: pageNumber });
      page.closeDrawer();
      page.navigate("/");

      return {
        totalMatches: matches.length,
        page: pageNumber,
        pageCount,
        products: getPage(matches, pageNumber).map((product) => ({
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          sizesInStock: sizesInStock(product),
        })),
      };
    },
  };
}

import detailsData from "@/data/product-details.json";

// Page-only extras (specs, fit, reviews). The tools never read them.

export type ProductDetailsData = {
  fit: "runs small" | "true to size" | "runs large";
  rating: number;
  reviewCount: number;
  specs: { label: string; value: string }[];
  reviews: { author: string; title: string; text: string }[];
};

const details = detailsData as Record<string, ProductDetailsData>;

export function getProductDetails(
  productId: string,
): ProductDetailsData | undefined {
  return details[productId];
}

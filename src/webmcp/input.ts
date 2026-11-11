import { getProduct } from "@/lib/catalog";
import { ALL_SIZES, type Product, type ProductColor, type Size } from "@/lib/types";

// The browser doesn't check input against inputSchema, so every tool checks its own.

export class ToolError extends Error {
  constructor(
    message: string,
    readonly data: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

// Agents often send null or "" for unused inputs; both mean "not given".
export function isGiven(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

export function optionalText(value: unknown, name: string): string | undefined {
  if (!isGiven(value)) return undefined;
  if (typeof value !== "string") throw new ToolError(`${name} must be text.`);
  return value.trim() || undefined;
}

export function optionalOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  name: string,
): T | undefined {
  if (!isGiven(value)) return undefined;
  if (!(allowed as readonly unknown[]).includes(value)) {
    throw new ToolError(
      `Unknown ${name}: ${String(value)}. Use one of: ${allowed.join(", ")}.`,
    );
  }
  return value as T;
}

// Boot sizes may come as numbers (10), so they are read as text ("10").
export function optionalSize(value: unknown): Size | undefined {
  return optionalOneOf(typeof value === "number" ? String(value) : value, ALL_SIZES, "size");
}

// 0 is a given price (it matches nothing), not "not given".
export function optionalPrice(value: unknown, name: string): number | undefined {
  if (!isGiven(value)) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new ToolError(`${name} must be a number in USD, above 0.`);
  }
  return value;
}

export function wholeNumber(value: unknown, name: string, min: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min) {
    throw new ToolError(`${name} must be a whole number, ${min} or more.`);
  }
  return value;
}

export function optionalWholeNumber(
  value: unknown,
  name: string,
  min: number,
): number | undefined {
  return isGiven(value) ? wholeNumber(value, name, min) : undefined;
}

export function requireProduct(value: unknown): Product {
  if (typeof value !== "string" || !value) {
    throw new ToolError("productId is required. Get product ids from search_products.");
  }
  const product = getProduct(value);
  if (!product) {
    throw new ToolError(`Unknown product: ${value}. Get product ids from search_products.`);
  }
  return product;
}

export function requireSizeFor(product: Product, value: unknown): Size {
  const size = typeof value === "number" ? String(value) : value;
  if (typeof size !== "string" || !(product.sizes as string[]).includes(size)) {
    throw new ToolError(
      `${product.name} has no size ${String(value)}. Its sizes: ${product.sizes.join(", ")}.`,
      { sizes: product.sizes },
    );
  }
  return size as Size;
}

// By id ("black") or by name ("Black").
export function requireColorFor(product: Product, value: unknown): ProductColor {
  const wanted = typeof value === "string" ? value.trim().toLowerCase() : "";
  const color = product.colors.find(
    (option) => option.id === wanted || option.name.toLowerCase() === wanted,
  );
  if (!color) {
    throw new ToolError(
      `${product.name} has no color ${String(value)}. Its colors: ${product.colors
        .map((option) => option.id)
        .join(", ")}.`,
    );
  }
  return color;
}

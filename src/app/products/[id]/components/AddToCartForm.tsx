"use client";

import { useState, type FormEvent } from "react";
import { ChipRadioGroup } from "@/app/components/ChipRadioGroup";
import { CheckIcon } from "@/app/components/icons";
import { QuantityStepper } from "@/app/components/QuantityStepper";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";
import { getStock, hasStock } from "@/lib/catalog";
import type { Product, Size } from "@/lib/types";

type Result =
  | { kind: "added"; size: Size; colorName: string }
  | { kind: "error"; message: string }
  | null;

const LOW_STOCK = 3;

/** The color shown first: the first one that still has stock in some size. */
export function getDefaultColorId(product: Product): string {
  return (
    product.colors.find((option) => hasStock(product, undefined, option.id)) ??
    product.colors[0]
  ).id;
}

export function AddToCartForm({
  product,
  colorId,
  onColorChange,
}: {
  product: Product;
  /** Selected color. Owned by the parent so the product image can show it too. */
  colorId: string;
  onColorChange: (colorId: string) => void;
}) {
  const color =
    product.colors.find((option) => option.id === colorId) ?? product.colors[0];

  const stockOf = (value: Size, forColor = colorId) =>
    getStock(product, forColor, value);
  const firstInStock = product.sizes.find((value) => stockOf(value) > 0);

  const [size, setSize] = useState<Size>(
    product.sizes.find((value) => stockOf(value, colorId) > 0) ??
      product.sizes[0],
  );
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<Result>(null);
  const addToCart = useCart((s) => s.addToCart);
  const openCart = useCartDrawer((s) => s.open);

  const stock = stockOf(size);
  const soldOut = !hasStock(product);
  const colorSoldOut = firstInStock === undefined;

  const stockText = colorSoldOut
    ? `Sold out in ${color.name}`
    : stock <= LOW_STOCK
      ? `Only ${stock} left in ${size}`
      : `${size} is in stock`;

  function handleColorChange(value: string) {
    onColorChange(value);
    // Keep the size if this color has it, otherwise move to its first size in stock.
    const next =
      stockOf(size, value) > 0
        ? size
        : (product.sizes.find((option) => stockOf(option, value) > 0) ?? size);
    setSize(next);
    setQuantity((current) =>
      Math.max(1, Math.min(current, Math.max(stockOf(next, value), 1))),
    );
    setResult(null);
  }

  function onSizeChange(value: Size) {
    setSize(value);
    setQuantity((current) => Math.max(1, Math.min(current, stockOf(value))));
    setResult(null);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      addToCart(product.id, size, color.id, quantity);
      setResult({ kind: "added", size, colorName: color.name });
    } catch (error) {
      setResult({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Could not add to cart.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-7">
      <ChipRadioGroup
        legend="Color"
        name="color"
        size="lg"
        value={colorId}
        onChange={handleColorChange}
        aside={color.name}
        options={product.colors.map((option) => ({
          value: option.id,
          label: option.name,
          swatch: option.hex,
          disabled: !hasStock(product, undefined, option.id),
          srSuffix: !hasStock(product, undefined, option.id)
            ? "(sold out)"
            : undefined,
        }))}
      />

      <ChipRadioGroup
        legend="Size"
        name="size"
        size="lg"
        value={size}
        onChange={onSizeChange}
        aside={stockText}
        options={product.sizes.map((value) => ({
          value,
          label: value,
          disabled: stockOf(value) <= 0,
          srSuffix: stockOf(value) <= 0 ? "(sold out)" : undefined,
        }))}
      />

      <div>
        <span id="quantity-label" className="label-caps mb-3 block">
          Quantity
        </span>
        <QuantityStepper
          labelledBy="quantity-label"
          size="lg"
          value={quantity}
          max={Math.max(stock, 1)}
          onChange={setQuantity}
        />
      </div>

      <button
        type="submit"
        disabled={colorSoldOut}
        className="h-14 w-full rounded-md bg-accent text-lg font-bold text-ink hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-panel disabled:text-muted"
      >
        {soldOut
          ? "Sold out"
          : colorSoldOut
            ? `Sold out in ${color.name}`
            : "Add to cart"}
      </button>

      {/* Reserved slot so the confirmation never shifts the layout. */}
      <div role="status" className="min-h-14">
        {result?.kind === "added" ? (
          <div className="flex min-h-14 items-center gap-3 rounded-md bg-ink px-5 py-3 text-white">
            <CheckIcon className="shrink-0 text-accent" width={18} height={18} />
            <p className="flex-1">
              Added to cart: {product.name}, {result.colorName}, {result.size}
            </p>
            <button
              type="button"
              onClick={openCart}
              className="font-bold text-accent underline underline-offset-2"
            >
              View cart
            </button>
          </div>
        ) : result?.kind === "error" ? (
          <p className="flex min-h-14 items-center rounded-md border border-red-600 bg-red-50 px-5 py-3 text-red-800">
            {result.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

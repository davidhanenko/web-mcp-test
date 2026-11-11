"use client";

import { useState, type FormEvent } from "react";
import { ChipRadioGroup } from "@/app/components/ChipRadioGroup";
import { CheckIcon } from "@/app/components/icons";
import { QuantityStepper } from "@/app/components/QuantityStepper";
import { useStockLoad } from "@/hooks/useStockLoad";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";
import { useToast } from "@/stores/toast";
import { getStock, hasStock } from "@/lib/catalog";
import type { Product, Size } from "@/lib/types";
import { SizeChartButton } from "./SizeChartButton";
import { SoldOutPanel } from "./SoldOutPanel";

type Result =
  | { kind: "added"; size: Size; colorName: string }
  | { kind: "error"; message: string }
  | null;

const LOW_STOCK = 3;

// The color shown first: the first one that still has stock in some size.
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
  // Selected color. Empty until the shopper picks a swatch.
  colorId: string;
  onColorChange: (colorId: string) => void;
}) {
  const color = product.colors.find((option) => option.id === colorId);

  const [size, setSize] = useState<Size | "">("");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<Result>(null);
  const addToCart = useCart((s) => s.addToCart);
  const openCart = useCartDrawer((s) => s.open);
  const showToast = useToast((s) => s.show);

  const loading = useStockLoad(colorId);
  const stock = color && size ? getStock(product, color.id, size) : 0;
  const sizeChosen = size !== "";
  const canAdd = Boolean(color) && !loading && sizeChosen && stock > 0;
  const soldOut = Boolean(color) && !loading && sizeChosen && stock <= 0;

  const stockText = loading
    ? "Checking availability…"
    : !color || !sizeChosen
    ? ""
    : stock <= 0
      ? `Sold out in ${color.name}`
      : stock <= LOW_STOCK
        ? `Only ${stock} left in ${size}`
        : `${size} is in stock`;

  function handleColorChange(value: string) {
    onColorChange(value);
    setSize("");
    setQuantity(1);
    setResult(null);
  }

  function onSizeChange(value: Size) {
    setSize(value);
    const nextStock = color ? getStock(product, color.id, value) : 0;
    setQuantity((current) =>
      Math.max(1, Math.min(current, Math.max(nextStock, 1))),
    );
    setResult(null);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!color || !size || stock <= 0) return;
    try {
      addToCart(product.id, size, color.id, quantity);
      setResult({ kind: "added", size, colorName: color.name });
      showToast(`Added ${product.name} (${color.name}, ${size}) to your cart.`);
    } catch (error) {
      setResult({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Could not add to cart.",
      });
    }
  }

  return (
    <>
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <ChipRadioGroup
        legend="Color"
        name="color"
        value={colorId}
        onChange={handleColorChange}
        aside={color?.name}
        swatchOnly
        options={product.colors.map((option) => ({
          value: option.id,
          label: option.name,
          swatch: option.hex,
        }))}
      />

      {color && loading ? (
        <div aria-hidden>
          <p className="label-caps mb-3">Size</p>
          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((value) => (
              <span
                key={value}
                className="h-11 w-14 animate-pulse rounded-full bg-panel"
              />
            ))}
          </div>
        </div>
      ) : color ? (
        <ChipRadioGroup<Size | "">
          legend="Size"
          name="size"
          value={size}
          onChange={(value) => {
            if (value) onSizeChange(value);
          }}
          aside={<SizeChartButton category={product.category} />}
          options={product.sizes.map((value) => ({
            value,
            label: value,
          }))}
        />
      ) : null}

      <div role="status" className="min-h-6 text-sm font-semibold">
        {stockText}
      </div>

      {canAdd ? (
        <div>
          <span id="quantity-label" className="label-caps mb-2 block">
            Quantity
          </span>
          <QuantityStepper
            labelledBy="quantity-label"
            value={quantity}
            max={stock}
            onChange={setQuantity}
          />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canAdd}
        className="h-12 w-full rounded-md bg-accent text-base font-bold text-ink hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-panel disabled:text-muted"
      >
        {soldOut && color
          ? `Sold out in ${color.name}`
          : "Add to cart"}
      </button>

      <div
        // Reserved slot so the confirmation never shifts the layout.
        role="status"
        className="min-h-12"
      >
        {result?.kind === "added" ? (
          <div className="flex min-h-12 items-center gap-3 rounded-md bg-ink px-5 py-3 text-white">
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
          <p className="flex min-h-12 items-center rounded-md border border-red-600 bg-red-50 px-5 py-3 text-red-800">
            {result.message}
          </p>
        ) : null}
      </div>
    </form>
    {/* Outside the form: it has its own form, and forms can't nest. */}
    {soldOut && color && size ? (
      <div className="mt-4">
        <SoldOutPanel product={product} colorName={color.name} size={size} />
      </div>
    ) : null}
    </>
  );
}

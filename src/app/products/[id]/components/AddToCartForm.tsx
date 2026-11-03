"use client";

import { useState, type FormEvent } from "react";
import { ChipRadioGroup } from "@/app/components/ChipRadioGroup";
import { CheckIcon } from "@/app/components/icons";
import { QuantityStepper } from "@/app/components/QuantityStepper";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";
import type { Product, Size } from "@/lib/types";

type Result =
  | { kind: "added"; size: Size }
  | { kind: "error"; message: string }
  | null;

const LOW_STOCK = 3;

export function AddToCartForm({ product }: { product: Product }) {
  const stockOf = (value: Size) => product.stock[value] ?? 0;
  const firstInStock = product.sizes.find((value) => stockOf(value) > 0);

  const [size, setSize] = useState<Size>(firstInStock ?? product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<Result>(null);
  const addToCart = useCart((s) => s.addToCart);
  const openCart = useCartDrawer((s) => s.open);

  const stock = stockOf(size);
  const soldOut = firstInStock === undefined;

  const stockText = soldOut
    ? "Sold out"
    : stock <= LOW_STOCK
      ? `Only ${stock} left in ${size}`
      : `${size} is in stock`;

  function onSizeChange(value: Size) {
    setSize(value);
    setQuantity((current) => Math.max(1, Math.min(current, stockOf(value))));
    setResult(null);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      addToCart(product.id, size, quantity);
      setResult({ kind: "added", size });
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
        disabled={soldOut}
        className="h-14 w-full rounded-md bg-accent text-lg font-bold text-ink hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-panel disabled:text-muted"
      >
        {soldOut ? "Sold out" : "Add to cart"}
      </button>

      {/* Reserved slot so the confirmation never shifts the layout. */}
      <div role="status" className="min-h-14">
        {result?.kind === "added" ? (
          <div className="flex min-h-14 items-center gap-3 rounded-md bg-ink px-5 py-3 text-white">
            <CheckIcon className="shrink-0 text-accent" width={18} height={18} />
            <p className="flex-1">
              Added to cart: {product.name}, {result.size}
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

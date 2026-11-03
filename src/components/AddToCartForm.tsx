"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { useCartUi } from "@/lib/cart-ui";
import { useToast } from "@/lib/toast";
import type { Product, Size } from "@/lib/types";

export function AddToCartForm({ product }: { product: Product }) {
  const [size, setSize] = useState<Size>(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const addToCart = useCart((s) => s.addToCart);
  const openCart = useCartUi((s) => s.open);
  const showToast = useToast((s) => s.show);

  const stock = product.stock[size] ?? 0;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      addToCart(product.id, size, qty);
      showToast(`Added ${product.name} (${size}) to cart`);
      openCart();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not add to cart.";
      showToast(message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-sm space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Size</legend>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((value) => (
            <label
              key={value}
              className={`inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-sm border px-3 text-sm ${
                size === value
                  ? "border-[#1c2e24] bg-[#1c2e24] text-[#f7f1e6]"
                  : "border-[#1c2e24]/20"
              }`}
            >
              <input
                type="radio"
                name="size"
                value={value}
                checked={size === value}
                onChange={() => setSize(value)}
                className="sr-only"
              />
              {value}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="qty" className="mb-1 block text-sm">
          Quantity
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={Math.max(stock, 1)}
          value={qty}
          onChange={(event) => setQty(Number(event.target.value))}
          className="h-10 w-24 rounded-sm border border-[#1c2e24]/20 bg-white px-3"
        />
        <p className="mt-1 min-h-5 text-sm text-[#1c2e24]/70">
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </p>
      </div>
      <button
        type="submit"
        className="h-11 w-full rounded-sm bg-[#1c2e24] text-[#f7f1e6] disabled:opacity-50"
        disabled={stock < 1}
      >
        Add to cart
      </button>
    </form>
  );
}

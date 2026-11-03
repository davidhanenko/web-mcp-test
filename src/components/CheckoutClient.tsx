"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function CheckoutClient() {
  const itemsState = useCart((s) => s.items);
  const getCart = useCart((s) => s.getCart);
  const { items, total } = getCart();
  const clearCart = useCart((s) => s.clearCart);
  void itemsState;
  const [placed, setPlaced] = useState(false);

  if (placed) {
    return (
      <div className="max-w-lg">
        <h1 className="font-serif text-3xl">Order placed</h1>
        <p className="mt-4 text-[#1c2e24]/80">
          Thanks — this is a demo, so nothing was charged. Your cart is empty.
        </p>
        <Link href="/" className="mt-6 inline-block underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg">
        <h1 className="font-serif text-3xl">Checkout</h1>
        <p className="mt-4">Your cart is empty.</p>
        <Link href="/" className="mt-6 inline-block underline">
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-3xl">Checkout</h1>
      <ul className="mt-6 divide-y divide-[#1c2e24]/10">
        {items.map((item) => (
          <li key={`${item.id}-${item.size}`} className="flex justify-between py-3">
            <span>
              {item.name} · {item.size} × {item.qty}
            </span>
            <span>{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between text-lg font-medium">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </p>
      <button
        type="button"
        className="mt-6 h-11 w-full rounded-sm bg-[#1c2e24] text-[#f7f1e6]"
        onClick={() => {
          clearCart();
          setPlaced(true);
        }}
      >
        Place order
      </button>
    </div>
  );
}

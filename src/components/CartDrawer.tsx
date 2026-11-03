"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useCartUi } from "@/lib/cart-ui";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const isOpen = useCartUi((s) => s.isOpen);
  const close = useCartUi((s) => s.close);
  const itemsState = useCart((s) => s.items);
  const getCart = useCart((s) => s.getCart);
  const { items, total } = getCart();
  const removeFromCart = useCart((s) => s.removeFromCart);
  void itemsState;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <div
      className={`fixed inset-0 z-40 ${isOpen ? "" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-[#f7f1e6] text-[#1c2e24] shadow-2xl transition-transform duration-200 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        {...(isOpen
          ? {
              role: "dialog" as const,
              "aria-modal": true,
              "aria-labelledby": "cart-heading",
            }
          : { "aria-hidden": true, inert: true })}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#1c2e24]/10 px-4">
          <h2 id="cart-heading" className="font-serif text-xl">
            Cart
          </h2>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm hover:bg-[#1c2e24]/5"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>
        <ul className="min-h-0 flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <li className="text-sm text-[#1c2e24]/70">Your cart is empty.</li>
          ) : (
            items.map((item) => (
              <li
                key={`${item.id}-${item.size}`}
                className="mb-4 flex gap-3 border-b border-[#1c2e24]/10 pb-4"
              >
                <img
                  src={item.image}
                  alt=""
                  width={480}
                  height={600}
                  className="h-[90px] w-[72px] shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-[#1c2e24]/70">
                    Size {item.size} · Qty {item.qty}
                  </p>
                  <p className="text-sm">{formatPrice(item.lineTotal)}</p>
                </div>
                <button
                  type="button"
                  className="self-start text-sm underline"
                  onClick={() => removeFromCart(item.id, item.size)}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-[#1c2e24]/10 p-4">
          <p className="mb-3 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </p>
          <Link
            href="/checkout"
            onClick={close}
            className="block rounded-sm bg-[#1c2e24] px-4 py-3 text-center text-[#f7f1e6]"
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}

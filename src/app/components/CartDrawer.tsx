"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CartSuggestions } from "@/app/components/CartSuggestions";
import { CloseIcon } from "@/app/components/icons";
import { QuantityStepper } from "@/app/components/QuantityStepper";
import { useCartDetails } from "@/hooks/useCartDetails";
import { getProduct, getStock } from "@/lib/catalog";
import { ColorSwatch } from "@/app/components/ColorSwatch";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const isOpen = useCartDrawer((s) => s.isOpen);
  const close = useCartDrawer((s) => s.close);
  const { items, total, totalQuantity } = useCartDetails();
  const removeFromCart = useCart((s) => s.removeFromCart);
  const setQuantity = useCart((s) => s.setQuantity);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [
        ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [isOpen, close]);

  function changeQuantity(
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ) {
    try {
      setQuantity(productId, size, color, quantity);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update cart.");
    }
  }

  return (
    <div
      className={`fixed inset-0 z-40 ${isOpen ? "" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-slate-900/55 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className={`absolute top-0 right-0 flex h-full w-full max-w-[480px] flex-col bg-white text-ink shadow-2xl transition-transform duration-200 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        {...(isOpen
          ? {
              role: "dialog" as const,
              "aria-modal": true,
              "aria-labelledby": "cart-heading",
            }
          : { "aria-hidden": true, inert: true })}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-line/70 px-6">
          <h2 id="cart-heading" className="font-display text-2xl">
            Your cart{" "}
            <span className="font-sans font-semibold text-muted normal-case [font-stretch:100%]">
              ({totalQuantity})
            </span>
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-line hover:bg-panel"
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <p className="text-lg font-semibold">Your cart is empty.</p>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 overflow-auto px-6">
            {items.map((item) => {
              const product = getProduct(item.productId);
              const inStock = product
                ? getStock(product, item.color, item.size)
                : item.quantity;
              return (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 border-b border-line/70 py-6"
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={600}
                    height={600}
                    className="h-[88px] w-[88px] shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="mt-0.5 text-sm text-muted">
                          <ColorSwatch hex={item.colorHex} />{" "}
                          {item.colorName} · Size {item.size}
                          {item.quantity > 1
                            ? ` · ${formatPrice(item.unitPrice)} each`
                            : null}
                        </p>
                      </div>
                      <p className="shrink-0 font-bold">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <QuantityStepper
                        itemName={item.name}
                        value={item.quantity}
                        max={inStock}
                        onChange={(quantity) =>
                          changeQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            quantity,
                          )
                        }
                      />
                      <button
                        type="button"
                        className="text-sm text-muted underline underline-offset-2 hover:text-ink"
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                      >
                        Remove<span className="sr-only"> {item.name}</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <CartSuggestions />

        <div className="shrink-0 bg-panel px-6 pt-6 pb-5">
          <p role="status" className="min-h-5 text-sm text-red-700">
            {error}
          </p>
          <p className="mb-4 flex items-baseline justify-between">
            <span className="label-caps">Total</span>
            <span className="text-3xl font-extrabold [font-stretch:110%]">
              {formatPrice(total, { cents: true })}
            </span>
          </p>
          {items.length > 0 ? (
            <Link
              href="/checkout"
              onClick={close}
              className="flex h-14 items-center justify-center rounded-md bg-accent text-lg font-bold text-ink hover:bg-accent-hover"
            >
              Go to checkout
            </Link>
          ) : null}
          <button
            type="button"
            onClick={close}
            className="mt-4 block w-full text-center font-semibold underline underline-offset-2"
          >
            Continue shopping
          </button>
        </div>
      </aside>
    </div>
  );
}

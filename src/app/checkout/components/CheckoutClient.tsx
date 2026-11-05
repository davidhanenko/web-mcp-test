"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { ColorSwatch } from "@/app/components/ColorSwatch";
import { SuccessMark } from "@/app/components/SuccessMark";
import { useIsSavedCartLoaded } from "@/hooks/useIsSavedCartLoaded";
import { useCartDetails } from "@/hooks/useCartDetails";
import { formatPrice } from "@/lib/format";
import { useCartDrawer } from "@/stores/cart-drawer";
import { useOrder } from "@/stores/order";

export function CheckoutClient() {
  const { items, total, totalQuantity } = useCartDetails();
  const openCart = useCartDrawer((s) => s.open);
  const placed = useOrder((s) => s.placed);
  const isSavedCartLoaded = useIsSavedCartLoaded();

  if (placed) {
    return (
      <CenteredMessage
        mark
        title="Order placed"
        body="Thanks for shopping at Northline Supply. This is a demo store, so no payment was taken and nothing will ship."
      />
    );
  }

  if (!isSavedCartLoaded) {
    // Reserve the page height until the saved cart is read, avoiding a flash of the empty state.
    return (
      <div className="min-h-[480px]">
        <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <CenteredMessage
        title="Your cart is empty"
        body="Add something from the shop, then come back here to place your order."
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-12">
        <section aria-labelledby="items-heading">
          <h2 id="items-heading" className="label-caps">
            Items ({totalQuantity})
          </h2>
          <ul className="mt-4">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex items-center gap-5 border-b border-line/70 py-6"
              >
                <Image
                  src={item.image}
                  alt=""
                  width={600}
                  height={600}
                  className="h-[88px] w-[88px] shrink-0 rounded-md object-cover sm:h-[104px] sm:w-[104px]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold">{item.name}</p>
                  <p className="text-muted">
                    <ColorSwatch hex={item.colorHex} size={14} />{" "}
                    {item.colorName} · Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-lg font-bold">
                  {formatPrice(item.subtotal, { cents: true })}
                </p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={openCart}
            className="mt-6 font-semibold underline underline-offset-2"
          >
            Edit cart
          </button>
        </section>

        <section
          aria-labelledby="summary-heading"
          className="self-start rounded-lg bg-panel p-8"
        >
          <h2
            id="summary-heading"
            className="border-b border-line pb-5 text-sm font-bold tracking-[0.14em] uppercase [font-stretch:115%]"
          >
            Order summary
          </h2>
          <p className="mt-6 flex items-baseline justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-4xl font-extrabold [font-stretch:110%]">
              {formatPrice(total, { cents: true })}
            </span>
          </p>
          <button
            type="button"
            className="mt-6 h-14 w-full rounded-md bg-accent text-lg font-bold text-ink hover:bg-accent-hover"
            onClick={() => useOrder.getState().placeOrder()}
          >
            Place order
          </button>
          <p className="mt-5 text-muted">
            Demo store. No payment is taken and nothing ships.
          </p>
        </section>
      </div>
    </div>
  );
}

function CenteredMessage({
  title,
  body,
  mark = false,
}: {
  title: string;
  body: ReactNode;
  mark?: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-12 text-center">
      {mark ? <SuccessMark /> : null}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display mt-8 text-4xl outline-none sm:text-5xl"
      >
        {title}
      </h1>
      <p className="mt-6 text-lg leading-8 text-slate-700">{body}</p>
      <Link
        href="/"
        onClick={() => useOrder.getState().reset()}
        className="mt-8 inline-flex h-14 items-center rounded-md bg-accent px-11 text-lg font-bold text-ink hover:bg-accent-hover"
      >
        Back to shop
      </Link>
    </div>
  );
}

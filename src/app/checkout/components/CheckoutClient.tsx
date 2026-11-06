"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { CenteredMessage } from "@/app/checkout/components/CenteredMessage";
import { ColorSwatch } from "@/app/components/ColorSwatch";
import { useIsSavedCartLoaded } from "@/hooks/useIsSavedCartLoaded";
import { useCartDetails } from "@/hooks/useCartDetails";
import { formatPrice } from "@/lib/format";
import { useAgentCartChanges } from "@/stores/agent-cart-changes";
import { useCartDrawer } from "@/stores/cart-drawer";
import { useOrder } from "@/stores/order";

export function CheckoutClient() {
  const router = useRouter();
  const { items, total, totalQuantity } = useCartDetails();
  const openCart = useCartDrawer((s) => s.open);
  const isSavedCartLoaded = useIsSavedCartLoaded();
  const [isPlacing, setIsPlacing] = useState(false);

  // Changes the agent made before this page opened are already in what the customer sees.
  // Only changes made while the customer is reviewing need a notice.
  const cartChangedByAgent = useAgentCartChanges((s) => s.count > s.countAtCheckoutOpen);

  // With cacheComponents, Next keeps this page hidden after the customer leaves instead of
  // unmounting it, and runs this effect again when they come back.
  // https://nextjs.org/docs/app/guides/preserving-ui-state#resetting-stale-status-messages
  useLayoutEffect(() => {
    useAgentCartChanges.getState().markCheckoutOpened();
    return () => setIsPlacing(false);
  }, []);

  function placeOrder() {
    const result = useOrder.getState().placeOrder();
    if (result && "error" in result) return;
    setIsPlacing(true);
    // replace: Back shouldn't return to the checkout of an order that's already placed.
    router.replace("/checkout/confirmation");
  }

  if (!isSavedCartLoaded || isPlacing) {
    // Reserve the page height until the saved cart is read, or until the confirmation
    // page opens after placing the order, avoiding a flash of the empty state.
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
          {/* Always rendered, so screen readers announce the notice when it appears. */}
          <div role="status">
            {cartChangedByAgent ? (
              <p className="mt-6 rounded-md border border-ink bg-white px-4 py-3 font-semibold">
                Your cart was changed. Check it before placing the order.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="mt-6 h-14 w-full rounded-md bg-accent text-lg font-bold text-ink hover:bg-accent-hover"
            onClick={placeOrder}
          >
            Place order
          </button>
        </section>
      </div>
    </div>
  );
}

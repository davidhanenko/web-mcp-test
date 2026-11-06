"use client";

import { CenteredMessage } from "@/app/checkout/components/CenteredMessage";
import { formatPrice } from "@/lib/format";
import { useOrder } from "@/stores/order";

export function OrderConfirmation() {
  const lastOrder = useOrder((s) => s.lastOrder);

  if (!lastOrder) {
    // Opened directly or after a reload: the order is kept in memory only.
    return (
      <CenteredMessage
        title="No recent order"
        body="Orders you place in this tab show up here."
      />
    );
  }

  return (
    <CenteredMessage
      mark
      title="Order placed"
      body="Thanks for shopping at Northline Supply."
    >
      <ul className="mt-8 w-full border-t border-line/70 text-left">
        {lastOrder.items.map((item) => (
          <li
            key={`${item.productId}-${item.size}-${item.color}`}
            className="flex items-baseline justify-between gap-4 border-b border-line/70 py-4"
          >
            <p>
              <span className="font-bold">{item.name}</span>{" "}
              <span className="text-muted">
                {item.colorName} · Size {item.size} · Qty {item.quantity}
              </span>
            </p>
            <p className="shrink-0 font-bold">
              {formatPrice(item.subtotal, { cents: true })}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex w-full items-baseline justify-between text-lg">
        <span className="font-semibold">Total</span>
        <span className="font-extrabold">
          {formatPrice(lastOrder.total, { cents: true })}
        </span>
      </p>
    </CenteredMessage>
  );
}

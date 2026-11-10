"use client";

import { useEffect, useRef } from "react";
import { dismissPromo, useMarketing } from "@/stores/marketing";
import { PROMO_CODE } from "@/lib/promo";

export function PromoModal() {
  const { ready, promoDismissed } = useMarketing();
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = ready && !promoDismissed;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissPromo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        className="w-full max-w-lg rounded-lg bg-white p-8 shadow-xl"
      >
        <p className="label-caps">Limited offer</p>
        <h2 id="promo-title" className="font-display mt-3 text-4xl">
          {PROMO_CODE}
        </h2>
        <p className="mt-4 text-base leading-7">
          Use code {PROMO_CODE} for $30 off each Ember Down Jacket. That makes
          it $169, less than the Granite Insulated Jacket at $175, and it is
          the warmer down jacket.
        </p>
        <p className="mt-3 text-sm text-muted">
          Enter the code at checkout. Closing this offer does not apply it.
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={dismissPromo}
          className="mt-6 h-12 w-full rounded-md bg-accent text-base font-bold text-ink hover:bg-accent-hover"
        >
          Close
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { dismissPromo, useMarketing } from "@/stores/marketing";
import { PROMO_CODE } from "@/lib/promo";

export function PromoModal() {
  const { ready, promoDismissed } = useMarketing();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const open = visible && ready && !promoDismissed;

  useEffect(() => {
    if (!ready || promoDismissed) {
      setVisible(false);
      return;
    }
    const show = () => setVisible(true);
    const timer = window.setTimeout(show, 12000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY >= max / 2) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ready, promoDismissed]);

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
        <p className="label-caps">This week</p>
        <h2 id="promo-title" className="font-display mt-3 text-4xl">
          $30 off the Ember Down Jacket
        </h2>
        <p className="mt-4 text-base leading-7">
          800-fill down for cold camps. Use code {PROMO_CODE} at checkout.
        </p>
        <p className="mt-3 text-lg">
          <span className="text-muted line-through">$199</span>{" "}
          <span className="font-bold">$169</span>
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products/ember-down-jacket"
            onClick={dismissPromo}
            className="flex h-12 flex-1 items-center justify-center rounded-md bg-accent text-base font-bold text-ink hover:bg-accent-hover"
          >
            Shop the jacket
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={dismissPromo}
            className="h-12 flex-1 rounded-md border border-line bg-white text-base font-semibold hover:bg-panel"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}

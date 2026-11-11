"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dismissPromo, useMarketing } from "@/stores/marketing";
import { PROMO_CODE } from "@/lib/promo";

const SHOW_AFTER_MS = 6000;

export function PromoModal() {
  const pathname = usePathname();
  const { ready, promoDismissed } = useMarketing();
  const closeRef = useRef<HTMLButtonElement>(null);
  // Set only from the timer and scroll callbacks.
  const [triggered, setTriggered] = useState(false);
  // The email only unlocks the code on screen. It is never stored or sent.
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  // Never on checkout (the shopper is paying there) or on the dev page.
  const hiddenHere =
    pathname.startsWith("/checkout") || pathname.startsWith("/dev");
  const open = triggered && ready && !promoDismissed && !hiddenHere;

  useEffect(() => {
    if (!ready || promoDismissed || hiddenHere) return;
    const show = () => setTriggered(true);
    const timer = window.setTimeout(show, SHOW_AFTER_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY >= max / 2) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ready, promoDismissed, hiddenHere]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissPromo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);
    setRevealed(true);
  }

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
          800-fill down for cold camps.{" "}
          {revealed
            ? `Use code ${PROMO_CODE} at checkout.`
            : "Join our list and we will show you the code."}
        </p>
        {revealed ? (
          <>
            <p className="mt-3 text-lg">
              <span className="text-muted line-through">$199</span>{" "}
              <span className="font-bold">$169</span>
            </p>
            <p
              role="status"
              className="mt-4 rounded-md bg-panel px-4 py-3 text-center text-2xl font-extrabold tracking-[0.12em]"
            >
              {PROMO_CODE}
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
                Close
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-6">
            <label htmlFor="promo-email" className="label-caps mb-2 block">
              Email
            </label>
            <input
              id="promo-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(null);
              }}
              autoComplete="off"
              placeholder="you@example.com"
              className="h-12 w-full rounded-md border border-line bg-white px-3 placeholder:text-muted"
            />
            <p role="status" className="mt-2 min-h-6 text-sm text-red-700">
              {emailError}
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="h-12 flex-1 rounded-md bg-accent text-base font-bold text-ink hover:bg-accent-hover"
              >
                Get my code
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={dismissPromo}
                className="h-12 flex-1 rounded-md border border-line bg-white text-base font-semibold hover:bg-panel"
              >
                No thanks
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

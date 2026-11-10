"use client";

import { saveCookieChoice, useMarketing } from "@/stores/marketing";

export function CookieBar() {
  const { ready, cookieChoice } = useMarketing();
  if (!ready || cookieChoice) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink px-6 py-4 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:px-2">
        <p className="text-sm leading-6">
          We use cookies to remember your cart, measure visits, and show
          offers. Choose accept or reject to continue.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => saveCookieChoice("reject")}
            className="h-11 rounded-md border border-white px-4 font-semibold"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => saveCookieChoice("accept")}
            className="h-11 rounded-md bg-accent px-4 font-bold text-ink hover:bg-accent-hover"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  saveCookieChoice,
  useMarketing,
  type CookiePrefs,
} from "@/stores/marketing";

const GROUPS: {
  key: keyof CookiePrefs;
  label: string;
  text: string;
}[] = [
  {
    key: "analytics",
    label: "Analytics",
    text: "Helps us count visits and see which pages get used.",
  },
  {
    key: "marketing",
    label: "Marketing",
    text: "Lets us show you offers on this site and on others.",
  },
  {
    key: "personalization",
    label: "Personalization",
    text: "Remembers what you looked at to suggest similar gear.",
  },
];

function PreferencesPanel({ onClose }: { onClose: () => void }) {
  const { cookiePrefs } = useMarketing();
  const [prefs, setPrefs] = useState<CookiePrefs>(cookiePrefs);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-prefs-title"
        className="w-full max-w-lg rounded-lg bg-white p-8 shadow-xl"
      >
        <h2 id="cookie-prefs-title" className="font-display text-3xl">
          Cookie preferences
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Choose which cookies we may use. You can change this later.
        </p>
        <ul className="mt-6 divide-y divide-line/70 border-y border-line/70">
          <li className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="font-bold">Necessary</p>
              <p className="text-sm text-muted">
                Keeps your cart and basic site features working.
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-muted">
              Always on
            </span>
          </li>
          {GROUPS.map((group) => (
            <li key={group.key}>
              <label className="flex cursor-pointer items-start justify-between gap-4 py-4">
                <span>
                  <span className="block font-bold">{group.label}</span>
                  <span className="block text-sm text-muted">{group.text}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={prefs[group.key]}
                  onChange={(event) =>
                    setPrefs({ ...prefs, [group.key]: event.target.checked })
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-ink"
                />
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => saveCookieChoice("custom", prefs)}
            className="h-12 flex-1 rounded-md bg-accent text-base font-bold text-ink hover:bg-accent-hover"
          >
            Save preferences
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-md border border-line bg-white text-base font-semibold hover:bg-panel"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieBar() {
  const { ready, cookieChoice } = useMarketing();
  const [managing, setManaging] = useState(false);

  if (!ready || cookieChoice) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink px-6 py-4 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:px-2">
          <p className="text-sm leading-6">
            We use cookies to remember your cart, measure visits, and show
            offers. Choose how we may use them.
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setManaging(true)}
              className="h-11 rounded-md px-3 font-semibold underline underline-offset-2"
            >
              Manage preferences
            </button>
            <button
              type="button"
              onClick={() => saveCookieChoice("reject")}
              className="h-11 rounded-md border border-white px-4 font-semibold"
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={() => saveCookieChoice("accept")}
              className="h-11 rounded-md bg-accent px-4 font-bold text-ink hover:bg-accent-hover"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
      {managing ? <PreferencesPanel onClose={() => setManaging(false)} /> : null}
    </>
  );
}

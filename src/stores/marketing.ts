"use client";

import { useSyncExternalStore } from "react";

export const COOKIE_STORAGE_KEY = "northline-cookie-choice";
export const PROMO_DISMISS_STORAGE_KEY = "northline-promo-dismissed";
export const PROMO_CODE_STORAGE_KEY = "northline-promo-code";
export const COOKIE_PREFS_STORAGE_KEY = "northline-cookie-prefs";

export type CookieChoice = "accept" | "reject" | "custom";

// What the shopper allowed. Necessary cookies are always on, so they are not listed.
export type CookiePrefs = {
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

const NO_COOKIE_PREFS: CookiePrefs = {
  analytics: false,
  marketing: false,
  personalization: false,
};

const ALL_COOKIE_PREFS: CookiePrefs = {
  analytics: true,
  marketing: true,
  personalization: true,
};

type MarketingState = {
  // False on the server and during hydration, so banners don't mismatch.
  ready: boolean;
  cookieChoice: CookieChoice | null;
  cookiePrefs: CookiePrefs;
  promoDismissed: boolean;
  appliedCode: string;
};

const serverState: MarketingState = {
  ready: false,
  cookieChoice: null,
  cookiePrefs: NO_COOKIE_PREFS,
  promoDismissed: false,
  appliedCode: "",
};

let state = serverState;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readChoice(value: string | null): CookieChoice | null {
  return value === "accept" || value === "reject" || value === "custom"
    ? value
    : null;
}

function readPrefs(value: string | null): CookiePrefs {
  if (!value) return NO_COOKIE_PREFS;
  try {
    const parsed = JSON.parse(value) as Partial<CookiePrefs>;
    return {
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      personalization: parsed.personalization === true,
    };
  } catch {
    return NO_COOKIE_PREFS;
  }
}

function readState(): MarketingState {
  return {
    ready: true,
    cookieChoice: readChoice(localStorage.getItem(COOKIE_STORAGE_KEY)),
    cookiePrefs: readPrefs(localStorage.getItem(COOKIE_PREFS_STORAGE_KEY)),
    promoDismissed: localStorage.getItem(PROMO_DISMISS_STORAGE_KEY) === "1",
    appliedCode: localStorage.getItem(PROMO_CODE_STORAGE_KEY) ?? "",
  };
}

function getSnapshot() {
  if (state === serverState && typeof window !== "undefined") {
    state = readState();
  }
  return state;
}

function commit(next: MarketingState) {
  state = next;
  emit();
}

export function useMarketing(): MarketingState {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverState);
}

export function readAppliedCode(): string {
  return getSnapshot().appliedCode;
}

// "accept" turns every optional group on, "reject" turns them all off, and "custom"
// saves exactly the groups passed in.
export function saveCookieChoice(choice: CookieChoice, prefs?: CookiePrefs) {
  const saved =
    choice === "accept"
      ? ALL_COOKIE_PREFS
      : choice === "reject"
        ? NO_COOKIE_PREFS
        : (prefs ?? NO_COOKIE_PREFS);
  localStorage.setItem(COOKIE_STORAGE_KEY, choice);
  localStorage.setItem(COOKIE_PREFS_STORAGE_KEY, JSON.stringify(saved));
  commit({
    ...getSnapshot(),
    ready: true,
    cookieChoice: choice,
    cookiePrefs: saved,
  });
}

export function dismissPromo() {
  localStorage.setItem(PROMO_DISMISS_STORAGE_KEY, "1");
  commit({ ...getSnapshot(), ready: true, promoDismissed: true });
}

export function saveAppliedCode(code: string) {
  if (code) localStorage.setItem(PROMO_CODE_STORAGE_KEY, code);
  else localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
  commit({ ...getSnapshot(), ready: true, appliedCode: code });
}

// Clears the cookie choice, the closed promo modal, and any applied code.
export function resetPopups() {
  localStorage.removeItem(COOKIE_STORAGE_KEY);
  localStorage.removeItem(COOKIE_PREFS_STORAGE_KEY);
  localStorage.removeItem(PROMO_DISMISS_STORAGE_KEY);
  localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
  commit({
    ready: true,
    cookieChoice: null,
    cookiePrefs: NO_COOKIE_PREFS,
    promoDismissed: false,
    appliedCode: "",
  });
}

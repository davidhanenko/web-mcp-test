"use client";

import { useSyncExternalStore } from "react";

export const COOKIE_STORAGE_KEY = "northline-cookie-choice";
export const PROMO_DISMISS_STORAGE_KEY = "northline-promo-dismissed";
export const PROMO_CODE_STORAGE_KEY = "northline-promo-code";

export type CookieChoice = "accept" | "reject";

type MarketingState = {
  // False on the server and during hydration, so banners don't mismatch.
  ready: boolean;
  cookieChoice: CookieChoice | null;
  promoDismissed: boolean;
  appliedCode: string;
};

const serverState: MarketingState = {
  ready: false,
  cookieChoice: null,
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
  return value === "accept" || value === "reject" ? value : null;
}

function readState(): MarketingState {
  return {
    ready: true,
    cookieChoice: readChoice(localStorage.getItem(COOKIE_STORAGE_KEY)),
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

export function saveCookieChoice(choice: CookieChoice) {
  localStorage.setItem(COOKIE_STORAGE_KEY, choice);
  commit({ ...getSnapshot(), ready: true, cookieChoice: choice });
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
  localStorage.removeItem(PROMO_DISMISS_STORAGE_KEY);
  localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
  commit({
    ready: true,
    cookieChoice: null,
    promoDismissed: false,
    appliedCode: "",
  });
}

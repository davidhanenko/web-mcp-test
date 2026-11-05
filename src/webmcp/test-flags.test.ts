import { beforeEach, describe, expect, it } from "vitest";
import {
  clearLastOrder,
  INJECTED_PRODUCT_ID,
  INJECTED_TEXT,
  LAST_ORDER_STORAGE_KEY,
  readTestFlags,
  saveLastOrder,
  saveTestFlags,
  TEST_FLAGS_STORAGE_KEY,
  withInjection,
} from "@/webmcp/test-flags";

beforeEach(() => {
  localStorage.clear();
});

describe("test flags", () => {
  it("defaults to all off", () => {
    expect(readTestFlags()).toEqual({ promptInjection: false });
  });

  it("reads a broken saved value as all off", () => {
    localStorage.setItem(TEST_FLAGS_STORAGE_KEY, "{not json");
    expect(readTestFlags()).toEqual({ promptInjection: false });
  });

  it("reads back the saved flags", () => {
    saveTestFlags({ promptInjection: true });
    expect(readTestFlags()).toEqual({ promptInjection: true });
  });
});

describe("withInjection", () => {
  it("leaves the description alone when the flag is off", () => {
    expect(withInjection(INJECTED_PRODUCT_ID, "Shell.")).toBe("Shell.");
  });

  it("adds the text to the injected product when the flag is on", () => {
    saveTestFlags({ promptInjection: true });
    expect(withInjection(INJECTED_PRODUCT_ID, "Shell.")).toBe(`Shell. ${INJECTED_TEXT}`);
  });

  it("leaves other products alone when the flag is on", () => {
    saveTestFlags({ promptInjection: true });
    expect(withInjection("mist-trail-jacket", "Jacket.")).toBe("Jacket.");
  });
});

describe("last order", () => {
  it("saves the placed items and clears them", () => {
    saveLastOrder([{ productId: "sun-trail-shirt", size: "M", color: "sand", quantity: 1 }]);
    const saved = JSON.parse(localStorage.getItem(LAST_ORDER_STORAGE_KEY)!);
    expect(saved.items).toEqual([
      { productId: "sun-trail-shirt", size: "M", color: "sand", quantity: 1 },
    ]);
    clearLastOrder();
    expect(localStorage.getItem(LAST_ORDER_STORAGE_KEY)).toBeNull();
  });
});

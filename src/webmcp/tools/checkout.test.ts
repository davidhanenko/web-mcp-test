import { beforeEach, describe, expect, it } from "vitest";
import { useCart } from "@/stores/cart";
import { readAppliedCode } from "@/stores/marketing";
import { LAST_ORDER_STORAGE_KEY } from "@/webmcp/test-flags";
import { CHECKOUT_HANDOFF } from "./open-checkout";
import { page, resetStores, run } from "./test-utils";

beforeEach(resetStores);

describe("apply_promo_code", () => {
  it("takes $30 off each Ember Down Jacket, for checkout and get_cart", async () => {
    useCart.getState().addToCart("ember-down-jacket", "M", "rust", 2);
    expect(await run("apply_promo_code", { code: " ridge30 " })).toEqual({
      appliedCode: "RIDGE30",
      discount: 60,
      payTotal: 338,
    });
    expect(readAppliedCode()).toBe("RIDGE30");
    expect(await run("get_cart")).toMatchObject({ total: 398, discount: 60, payTotal: 338 });
  });

  it("applies a valid code with no promo item, and says the discount is $0", async () => {
    useCart.getState().addToCart("granite-insulated-jacket", "L", "grey", 1);
    const result = await run("apply_promo_code", { code: "RIDGE30" });
    expect(result).toMatchObject({ appliedCode: "RIDGE30", discount: 0, payTotal: 175 });
    expect(result.note).toContain("Ember Down Jacket");
  });

  it("returns an error for an unknown code and applies nothing", async () => {
    const result = await run("apply_promo_code", { code: "FREESTUFF" });
    expect(result.error).toContain("not a valid code");
    expect(readAppliedCode()).toBe("");
  });

  it("removes the code for an empty string", async () => {
    await run("apply_promo_code", { code: "RIDGE30" });
    expect(await run("apply_promo_code", { code: "" })).toEqual({
      appliedCode: null,
      discount: 0,
      payTotal: 0,
    });
    expect(readAppliedCode()).toBe("");
  });

  it("returns an error for a code that isn't text", async () => {
    expect((await run("apply_promo_code", { code: 30 })).error).toContain("text");
  });
});

describe("open_checkout", () => {
  it("opens checkout, returns the cart and the handoff, and places no order", async () => {
    useCart.getState().addToCart("ember-down-jacket", "M", "rust", 1);
    await run("apply_promo_code", { code: "RIDGE30" });

    const result = await run("open_checkout");
    expect(result).toMatchObject({
      total: 199,
      discount: 30,
      payTotal: 169,
      handoff: CHECKOUT_HANDOFF,
    });
    expect(page.closeDrawer).toHaveBeenCalledOnce();
    expect(page.navigate).toHaveBeenCalledWith("/checkout");
    expect(useCart.getState().items).toHaveLength(1);
    expect(localStorage.getItem(LAST_ORDER_STORAGE_KEY)).toBeNull();
  });

  it("returns an error for an empty cart and stays on the page", async () => {
    expect((await run("open_checkout")).error).toContain("empty");
    expect(page.navigate).not.toHaveBeenCalled();
  });
});

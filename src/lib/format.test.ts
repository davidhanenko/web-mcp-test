import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats whole dollars by default", () => {
    expect(formatPrice(129)).toBe("$129");
  });

  it("formats with cents when asked", () => {
    expect(formatPrice(165, { cents: true })).toBe("$165.00");
    expect(formatPrice(1234.5, { cents: true })).toBe("$1,234.50");
  });
});

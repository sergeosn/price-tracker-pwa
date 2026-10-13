import { describe, expect, it } from "vitest";
import { formatMoney, isTargetReached, toCents } from "./money";

describe("toCents", () => {
  it.each([
    ["1299.00", 129900],
    ["1299.5", 129950],
    ["1299", 129900],
    ["0.07", 7],
    [" 15.99 ", 1599],
  ])("converts %j to %i", (input, expected) => {
    expect(toCents(input)).toBe(expected);
  });

  it.each(["", "abc", "1.234", "-5", "1,5"])("rejects %j", (input) => {
    expect(() => toCents(input)).toThrow(RangeError);
  });
});

describe("isTargetReached", () => {
  it("is false when either price is missing", () => {
    expect(isTargetReached(null, "10.00")).toBe(false);
    expect(isTargetReached("10.00", null)).toBe(false);
  });

  it("is true when the current price is equal to or below the target", () => {
    expect(isTargetReached("10.00", "10")).toBe(true);
    expect(isTargetReached("9.99", "10.00")).toBe(true);
  });

  it("is false when the current price is above the target", () => {
    expect(isTargetReached("10.01", "10.00")).toBe(false);
  });
});

describe("formatMoney", () => {
  it("formats with a currency", () => {
    expect(formatMoney("1299.00", "USD", "en-US")).toBe("$1,299.00");
  });

  it("formats without a currency as a plain number with two decimals", () => {
    expect(formatMoney("1299.5", null, "en-US")).toBe("1,299.50");
  });
});

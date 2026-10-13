import { describe, expect, it } from "vitest";
import { describeCheckResult } from "./checkResult";

describe("describeCheckResult", () => {
  it("describes a price change", () => {
    const result = { status: "ok", price: "1199.00", changed: true, error: null } as const;
    expect(describeCheckResult(result, "1299.00", "USD", "en-US")).toEqual({
      color: "green",
      title: "Price changed",
      message: "$1,299.00 → $1,199.00",
    });
  });

  it("describes the first price found", () => {
    const result = { status: "ok", price: "10.00", changed: true, error: null } as const;
    expect(describeCheckResult(result, null, null, "en-US").message).toBe("— → 10.00");
  });

  it("describes an unchanged price", () => {
    const result = { status: "ok", price: "1299.00", changed: false, error: null } as const;
    expect(describeCheckResult(result, "1299.00", "USD", "en-US")).toEqual({
      color: "blue",
      title: "No change",
      message: "Current price: $1,299.00",
    });
  });

  it("passes the backend error through", () => {
    const result = {
      status: "error",
      price: null,
      changed: false,
      error: "Currency mismatch",
    } as const;
    expect(describeCheckResult(result, "1299.00", "USD")).toEqual({
      color: "yellow",
      title: "Couldn't get the price",
      message: "Currency mismatch",
    });
  });
});

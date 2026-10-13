import { describe, expect, it } from "vitest";
import { ApiError } from "../api/errors";
import { shouldRetry } from "./queryClient";

describe("shouldRetry", () => {
  it("retries network and server errors up to two times", () => {
    expect(shouldRetry(0, new ApiError("network", "x"))).toBe(true);
    expect(shouldRetry(1, new ApiError("server", "x", { status: 502 }))).toBe(true);
    expect(shouldRetry(2, new ApiError("network", "x"))).toBe(false);
  });

  it.each(["unauthorized", "not_found", "conflict", "validation", "unexpected"] as const)(
    "never retries %s",
    (kind) => {
      expect(shouldRetry(0, new ApiError(kind, "x"))).toBe(false);
    },
  );

  it("never retries unknown errors", () => {
    expect(shouldRetry(0, new Error("boom"))).toBe(false);
  });
});

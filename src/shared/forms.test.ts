import { describe, expect, it } from "vitest";
import { ApiError } from "../api/errors";
import { formErrorsFromApiError } from "./forms";

const conflict = { field: "url", message: "This product is already being tracked" };

describe("formErrorsFromApiError", () => {
  it("maps a conflict to the configured field", () => {
    expect(formErrorsFromApiError(new ApiError("conflict", "dup"), conflict)).toEqual({
      url: "This product is already being tracked",
    });
  });

  it("returns 422 field errors as they are", () => {
    const error = new ApiError("validation", "x", { fieldErrors: { domain: "Invalid domain" } });
    expect(formErrorsFromApiError(error)).toEqual({ domain: "Invalid domain" });
  });

  it("returns null for errors that are not about fields", () => {
    expect(formErrorsFromApiError(new ApiError("conflict", "dup"))).toBeNull();
    expect(formErrorsFromApiError(new ApiError("validation", "x"))).toBeNull();
    expect(formErrorsFromApiError(new ApiError("server", "x"))).toBeNull();
    expect(formErrorsFromApiError(new Error("x"))).toBeNull();
  });
});

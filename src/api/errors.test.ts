import { describe, expect, it } from "vitest";
import {
  ApiError,
  NETWORK_ERROR_MESSAGE,
  apiErrorFromResponse,
  isApiError,
  isCancelled,
  networkError,
} from "./errors";

describe("apiErrorFromResponse", () => {
  it("maps 401 to unauthorized", () => {
    const error = apiErrorFromResponse(401, { detail: "Invalid or missing API key" });
    expect(error.kind).toBe("unauthorized");
    expect(error.message).toBe("Invalid API key");
    expect(error.status).toBe(401);
  });

  it("maps 404 to not_found with the backend detail", () => {
    const error = apiErrorFromResponse(404, { detail: "Product 7 not found" });
    expect(error.kind).toBe("not_found");
    expect(error.message).toBe("Product 7 not found");
  });

  it("maps 409 to conflict", () => {
    expect(apiErrorFromResponse(409, { detail: "Duplicate" }).kind).toBe("conflict");
  });

  it("maps 422 body errors to field errors and ignores query errors", () => {
    const error = apiErrorFromResponse(422, {
      detail: [
        { loc: ["body", "url"], msg: "URL must be an absolute http(s) URL", type: "value_error" },
        { loc: ["body", "url"], msg: "second message is ignored", type: "value_error" },
        { loc: ["query", "limit"], msg: "too big", type: "less_than_equal" },
      ],
    });
    expect(error.kind).toBe("validation");
    expect(error.fieldErrors).toEqual({ url: "URL must be an absolute http(s) URL" });
  });

  it("tolerates a 422 without a usable detail", () => {
    expect(apiErrorFromResponse(422, "oops").fieldErrors).toEqual({});
  });

  it("maps 5xx to server", () => {
    const error = apiErrorFromResponse(503, { detail: "Database unavailable" });
    expect(error.kind).toBe("server");
    expect(error.message).toBe("Server error (503). Try again later.");
  });

  it("maps other statuses to unexpected", () => {
    expect(apiErrorFromResponse(400, undefined).kind).toBe("unexpected");
  });
});

describe("networkError", () => {
  it("wraps the cause with a friendly message", () => {
    const cause = new TypeError("Failed to fetch");
    const error = networkError(cause);
    expect(error.kind).toBe("network");
    expect(error.message).toBe(NETWORK_ERROR_MESSAGE);
    expect(error.cause).toBe(cause);
  });
});

describe("isApiError", () => {
  it("recognises ApiError instances only", () => {
    expect(isApiError(new ApiError("server", "x"))).toBe(true);
    expect(isApiError(new Error("x"))).toBe(false);
  });
});

describe("isCancelled", () => {
  it("recognises aborted requests only", () => {
    expect(isCancelled(networkError(new DOMException("aborted", "AbortError")))).toBe(true);
    expect(isCancelled(networkError(new TypeError("Failed to fetch")))).toBe(false);
    expect(isCancelled(new ApiError("server", "x"))).toBe(false);
  });
});

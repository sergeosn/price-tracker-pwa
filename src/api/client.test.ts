import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { TEST_API_KEY, TEST_API_URL, apiPath, server } from "../test/server";
import { createApiClient, unwrap } from "./client";
import { ApiError } from "./errors";

// Create clients inside tests: openapi-fetch captures `fetch` on creation, and MSW patches it
// only when the server starts listening (in beforeAll).
function makeApi() {
  return createApiClient({ apiUrl: TEST_API_URL, apiKey: TEST_API_KEY });
}

describe("createApiClient + unwrap", () => {
  it("sends the API key and returns data", async () => {
    let receivedKey: string | null = null;
    server.use(
      http.get(apiPath("/api/v1/domain-rules"), ({ request }) => {
        receivedKey = request.headers.get("X-API-Key");
        return HttpResponse.json({ items: [], total: 0, limit: 50, offset: 0 });
      }),
    );

    const page = await unwrap(makeApi().GET("/api/v1/domain-rules"));

    expect(receivedKey).toBe(TEST_API_KEY);
    expect(page.total).toBe(0);
  });

  it("throws an ApiError built from the error response", async () => {
    server.use(
      http.get(apiPath("/api/v1/products/7"), () =>
        HttpResponse.json({ detail: "Product 7 not found" }, { status: 404 }),
      ),
    );

    const call = unwrap(
      makeApi().GET("/api/v1/products/{product_id}", { params: { path: { product_id: 7 } } }),
    );

    await expect(call).rejects.toMatchObject({ kind: "not_found", message: "Product 7 not found" });
  });

  it("throws a network ApiError when fetch fails", async () => {
    server.use(http.get(apiPath("/api/v1/domain-rules"), () => HttpResponse.error()));

    const error = await unwrap(makeApi().GET("/api/v1/domain-rules")).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "network" });
  });

  it("returns undefined for 204 responses", async () => {
    server.use(
      http.delete(apiPath("/api/v1/domain-rules/3"), () => new HttpResponse(null, { status: 204 })),
    );

    const result = await unwrap(
      makeApi().DELETE("/api/v1/domain-rules/{rule_id}", { params: { path: { rule_id: 3 } } }),
    );

    expect(result).toBeUndefined();
  });
});

import createClient, { type Client } from "openapi-fetch";
import { apiErrorFromResponse, networkError } from "./errors";
import type { paths } from "./schema";

export type ApiClient = Client<paths>;

export interface ApiConfig {
  apiUrl: string;
  apiKey: string;
}

/** `signal` cancels every request of this client, e.g. when the user switches servers. */
export function createApiClient({ apiUrl, apiKey }: ApiConfig, signal?: AbortSignal): ApiClient {
  const client = createClient<paths>({ baseUrl: apiUrl, signal });
  client.use({
    onRequest({ request }) {
      request.headers.set("X-API-Key", apiKey);
      return request;
    },
  });
  return client;
}

/**
 * Awaits an openapi-fetch call and returns its data, or throws an ApiError.
 * Usage: `await unwrap(api.GET("/api/v1/products/{product_id}", { params }))`.
 */
export async function unwrap<T>(
  call: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  let result: Awaited<typeof call>;
  try {
    result = await call;
  } catch (cause) {
    throw networkError(cause);
  }
  if (!result.response.ok) {
    throw apiErrorFromResponse(result.response.status, result.error);
  }
  return result.data as T;
}

import { createApiClient, unwrap } from "../../api/client";
import type { Settings } from "./storage";

/**
 * Resolves when the server answers an authenticated request; throws an ApiError otherwise.
 * Uses /products rather than /health because /health does not check the API key.
 */
export async function testConnection(settings: Settings): Promise<void> {
  const api = createApiClient(settings);
  await unwrap(api.GET("/api/v1/products", { params: { query: { limit: 1 } } }));
}

import { setupServer } from "msw/node";

export const TEST_API_URL = "http://api.test";
export const TEST_API_KEY = "test-key";

/** Absolute URL of an API path, for MSW handlers: apiPath("/api/v1/products"). */
export function apiPath(path: string): string {
  return `${TEST_API_URL}${path}`;
}

/** No default handlers: every test declares the endpoints it needs with server.use(). */
export const server = setupServer();

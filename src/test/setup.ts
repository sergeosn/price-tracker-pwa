import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { notifications } from "@mantine/notifications";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

// Browser APIs Mantine relies on that jsdom does not implement.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverStub;
window.HTMLElement.prototype.scrollIntoView = () => {};

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  notifications.clean();
  server.resetHandlers();
  window.localStorage.clear();
});
afterAll(() => server.close());

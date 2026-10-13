import { expect, it } from "vitest";
import { formatDateTime } from "./dates";

it("formats an ISO timestamp with date and time", () => {
  const text = formatDateTime("2026-10-13T09:30:00Z", "en-US");
  expect(text).toContain("Oct 13, 2026");
});

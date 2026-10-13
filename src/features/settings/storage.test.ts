import { afterEach, describe, expect, it, vi } from "vitest";
import { SETTINGS_STORAGE_KEY, loadSettings, normalizeApiUrl, saveSettings } from "./storage";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("normalizeApiUrl", () => {
  it("trims whitespace and trailing slashes", () => {
    expect(normalizeApiUrl("  http://localhost:8000//  ")).toBe("http://localhost:8000");
  });

  it.each([
    "http://localhost:8000/api/v1",
    "http://localhost:8000/api/v1/",
    "http://localhost:8000/api",
  ])("drops the API path suffix from %j", (url) => {
    expect(normalizeApiUrl(url)).toBe("http://localhost:8000");
  });
});

describe("loadSettings / saveSettings", () => {
  it("round-trips settings", () => {
    expect(saveSettings({ apiUrl: "http://localhost:8000", apiKey: "k" })).toBe(true);
    expect(loadSettings()).toEqual({ apiUrl: "http://localhost:8000", apiKey: "k" });
  });

  it("returns null when nothing is stored", () => {
    expect(loadSettings()).toBeNull();
  });

  it("returns null for corrupted or incomplete JSON", () => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, "{not json");
    expect(loadSettings()).toBeNull();
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ apiUrl: "x", apiKey: "" }));
    expect(loadSettings()).toBeNull();
  });

  it("survives a storage that throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(loadSettings()).toBeNull();
    expect(saveSettings({ apiUrl: "http://a", apiKey: "k" })).toBe(false);
  });
});

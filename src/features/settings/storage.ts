import type { ApiConfig } from "../../api/client";

export type Settings = ApiConfig;

export const SETTINGS_STORAGE_KEY = "price-tracker.settings";

/**
 * The server's base URL: trimmed, without trailing slashes and without an `/api` or `/api/v1`
 * suffix (the backend README shows `http://localhost:8000/api/v1`, which users tend to paste).
 */
export function normalizeApiUrl(url: string): string {
  return url
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api(\/v1)?$/, "");
}

/** localStorage can be missing or throw (privacy modes, blocked site data). */
function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadSettings(): Settings | null {
  try {
    const raw = getStorage()?.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "apiUrl" in parsed &&
      "apiKey" in parsed &&
      typeof parsed.apiUrl === "string" &&
      typeof parsed.apiKey === "string" &&
      parsed.apiUrl &&
      parsed.apiKey
    ) {
      return { apiUrl: parsed.apiUrl, apiKey: parsed.apiKey };
    }
    return null;
  } catch {
    return null;
  }
}

/** Returns false when the settings could not be persisted (they still apply for this session). */
export function saveSettings(settings: Settings): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

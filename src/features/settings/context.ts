import { createContext, use, useMemo } from "react";
import { createApiClient, type ApiClient } from "../../api/client";
import type { Settings } from "./storage";

export interface SettingsContextValue {
  /** null until the user saves an API URL and key. */
  settings: Settings | null;
  /** Aborted when the settings change, so late responses never reach the new session's cache. */
  signal: AbortSignal;
  updateSettings: (settings: Settings) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const value = use(SettingsContext);
  if (!value) {
    throw new Error("useSettings must be used inside <SettingsProvider>");
  }
  return value;
}

/** The API client for the saved settings. Only for screens behind <RequireSettings>. */
export function useApi(): ApiClient {
  const { settings, signal } = useSettings();
  const client = useMemo(
    () => (settings ? createApiClient(settings, signal) : null),
    [settings, signal],
  );
  if (!client) {
    throw new Error("API settings are not configured");
  }
  return client;
}

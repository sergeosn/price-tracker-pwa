import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { SettingsContext } from "./context";
import { loadSettings, saveSettings, type Settings } from "./storage";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Settings | null>(loadSettings);
  const [requests, setRequests] = useState(() => new AbortController());

  const updateSettings = useCallback(
    (next: Settings) => {
      saveSettings(next);
      // Data from another server or key must not leak into the new session: cancel requests that
      // are still running (a late mutation result would be written into the cleared cache).
      requests.abort();
      setRequests(new AbortController());
      setSettings(next);
      queryClient.clear();
    },
    [queryClient, requests],
  );

  const value = useMemo(
    () => ({ settings, signal: requests.signal, updateSettings }),
    [settings, requests, updateSettings],
  );
  return <SettingsContext value={value}>{children}</SettingsContext>;
}

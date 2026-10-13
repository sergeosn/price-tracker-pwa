import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { SettingsContext } from "./context";
import { loadSettings, saveSettings, type Settings } from "./storage";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Settings | null>(loadSettings);

  const updateSettings = useCallback(
    (next: Settings) => {
      saveSettings(next);
      setSettings(next);
      // Data from another server or key must not leak into the new session.
      queryClient.clear();
    },
    [queryClient],
  );

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);
  return <SettingsContext value={value}>{children}</SettingsContext>;
}

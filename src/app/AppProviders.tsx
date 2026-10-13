import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SettingsProvider } from "../features/settings/SettingsProvider";

const theme = createTheme({ primaryColor: "blue" });

interface AppProvidersProps {
  queryClient: QueryClient;
  children: ReactNode;
  /** "test" disables Mantine transitions and portals in tests. */
  env?: "default" | "test";
}

export function AppProviders({ queryClient, children, env = "default" }: AppProvidersProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto" env={env}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <ModalsProvider>{children}</ModalsProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

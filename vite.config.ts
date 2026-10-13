/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
  version: string;
};

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      pwaAssets: { image: "public/favicon.svg" },
      manifest: {
        name: "Price Tracker",
        short_name: "Prices",
        description: "Track product prices by URL",
        display: "standalone",
        start_url: "/",
        theme_color: "#228be6",
        background_color: "#ffffff",
      },
      workbox: {
        navigateFallback: "/index.html",
      },
    }),
  ],
  build: {
    // Mantine + Recharts make one ~1.2 MB chunk; code splitting is out of scope for the MVP.
    chunkSizeWarningLimit: 1500,
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  test: {
    environment: "jsdom",
    // Node 25+ ships its own global localStorage, which hides jsdom's implementation.
    execArgv: ["--no-experimental-webstorage"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/api/schema.d.ts", "src/test/**", "src/main.tsx"],
    },
  },
});

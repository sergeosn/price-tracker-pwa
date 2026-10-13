/// <reference types="vite/client" />

/** App version from package.json, injected by Vite `define`. */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** Optional default API URL shown on the Settings screen. */
  readonly VITE_API_URL?: string;
}

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { AppProviders } from "../app/AppProviders";
import { createQueryClient } from "../app/queryClient";
import { routes } from "../app/routes";
import { saveSettings, type Settings } from "../features/settings/storage";
import { TEST_API_KEY, TEST_API_URL } from "./server";

export const TEST_SETTINGS: Settings = { apiUrl: TEST_API_URL, apiKey: TEST_API_KEY };

interface RenderAppOptions {
  /** Initial URL, e.g. "/products/1". */
  route?: string;
  /** Stored settings; null renders the app as on first launch. */
  settings?: Settings | null;
}

/** Renders the whole app (real routes and providers) at a URL, with MSW serving the API. */
export function renderApp({ route = "/", settings = TEST_SETTINGS }: RenderAppOptions = {}) {
  if (settings) {
    saveSettings(settings);
  }
  const queryClient = createQueryClient({ retry: false });
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  const user = userEvent.setup();
  render(
    <AppProviders queryClient={queryClient} env="test">
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { user, router, queryClient };
}

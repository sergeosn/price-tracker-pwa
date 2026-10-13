import { Navigate, type RouteObject } from "react-router";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { Layout } from "./Layout";
import { RequireSettings } from "./RequireSettings";
import { RouteError } from "./RouteError";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: "settings", element: <SettingsPage /> },
      {
        element: <RequireSettings />,
        children: [{ index: true, element: <p>Products list comes in the next task.</p> }],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

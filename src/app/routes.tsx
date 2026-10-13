import { Navigate, type RouteObject } from "react-router";
import { ProductDetailsPage } from "../features/products/pages/ProductDetailsPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
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
        children: [
          { index: true, element: <ProductsPage /> },
          { path: "products/:productId", element: <ProductDetailsPage /> },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];

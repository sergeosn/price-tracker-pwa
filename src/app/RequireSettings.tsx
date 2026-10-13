import { Navigate, Outlet } from "react-router";
import { useSettings } from "../features/settings/context";

/** Sends the user to Settings until an API URL and key are saved. */
export function RequireSettings() {
  const { settings } = useSettings();
  return settings ? <Outlet /> : <Navigate to="/settings" replace />;
}

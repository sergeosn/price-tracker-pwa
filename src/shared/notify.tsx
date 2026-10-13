import { Anchor } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link } from "react-router";
import { isApiError, isCancelled } from "../api/errors";

const UNAUTHORIZED_NOTIFICATION_ID = "unauthorized";

/** Shown once for any 401, from the global query/mutation cache handlers. */
export function notifyUnauthorized(): void {
  notifications.hide(UNAUTHORIZED_NOTIFICATION_ID);
  notifications.show({
    id: UNAUTHORIZED_NOTIFICATION_ID,
    color: "red",
    title: "Invalid API key",
    message: (
      <Anchor component={Link} to="/settings" size="sm">
        Update it in Settings
      </Anchor>
    ),
  });
}

/**
 * Generic error toast for failed mutations. 401 is skipped (notifyUnauthorized handles it), and so
 * are requests cancelled by a settings change.
 */
export function notifyError(error: unknown): void {
  if ((isApiError(error) && error.kind === "unauthorized") || isCancelled(error)) {
    return;
  }
  notifications.show({
    color: "red",
    title: "Request failed",
    message: error instanceof Error ? error.message : "Something went wrong",
  });
}

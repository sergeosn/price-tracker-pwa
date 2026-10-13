import { Badge } from "@mantine/core";
import type { CheckStatus } from "../../api/types";
import { assertNever } from "../assertNever";

function statusView(status: CheckStatus): { color: string; label: string } {
  switch (status) {
    case "never":
      return { color: "gray", label: "Not checked" };
    case "ok":
      return { color: "green", label: "OK" };
    case "error":
      return { color: "red", label: "Error" };
    default:
      return assertNever(status);
  }
}

export function CheckStatusBadge({ status }: { status: CheckStatus }) {
  const { color, label } = statusView(status);
  return (
    <Badge color={color} variant="light">
      {label}
    </Badge>
  );
}

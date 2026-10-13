import { Alert, Button, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { ReactNode } from "react";

interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  /** Extra actions, e.g. a "Back to products" link. */
  children?: ReactNode;
}

export function ErrorState({
  error,
  title = "Something went wrong",
  onRetry,
  children,
}: ErrorStateProps) {
  return (
    <Alert color="red" title={title} icon={<IconAlertCircle />}>
      <Stack gap="xs" align="flex-start">
        <Text size="sm">{error instanceof Error ? error.message : "Unexpected error"}</Text>
        {onRetry && (
          <Button size="xs" variant="light" color="red" onClick={onRetry}>
            Retry
          </Button>
        )}
        {children}
      </Stack>
    </Alert>
  );
}

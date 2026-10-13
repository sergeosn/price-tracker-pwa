import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { useRouteError } from "react-router";

/** Last-resort screen for render errors, so the user never sees a blank page. */
export function RouteError() {
  const error = useRouteError();
  return (
    <Center h="100vh" p="md">
      <Stack align="center" gap="sm">
        <Title order={3}>Something went wrong</Title>
        <Text c="dimmed" size="sm" ta="center">
          {error instanceof Error ? error.message : "Unexpected error"}
        </Text>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </Stack>
    </Center>
  );
}

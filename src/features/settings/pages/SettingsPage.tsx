import { Alert, Button, Group, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { httpUrlSchema } from "../../../shared/validation";
import { testConnection } from "../connection";
import { useSettings } from "../context";
import { normalizeApiUrl, type Settings } from "../storage";

const settingsSchema = z.object({
  apiUrl: httpUrlSchema("Enter an http(s) URL, e.g. http://localhost:8000"),
  apiKey: z.string().trim().min(1, "Enter the API key"),
});

type SettingsFormValues = z.input<typeof settingsSchema>;

type ConnectionState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok" }
  | { status: "error"; message: string };

function toSettings(values: SettingsFormValues): Settings {
  return { apiUrl: normalizeApiUrl(values.apiUrl), apiKey: values.apiKey.trim() };
}

export function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<ConnectionState>({ status: "idle" });
  const form = useForm<SettingsFormValues>({
    mode: "uncontrolled",
    initialValues: {
      apiUrl: settings?.apiUrl ?? import.meta.env.VITE_API_URL ?? "",
      apiKey: settings?.apiKey ?? "",
    },
    validate: schemaResolver(settingsSchema, { sync: true }),
  });

  async function handleTestConnection() {
    if (form.validate().hasErrors) {
      return;
    }
    setConnection({ status: "checking" });
    try {
      await testConnection(toSettings(form.getValues()));
      setConnection({ status: "ok" });
    } catch (error) {
      setConnection({
        status: "error",
        message: error instanceof Error ? error.message : "Connection failed",
      });
    }
  }

  function handleSave(values: SettingsFormValues) {
    updateSettings(toSettings(values));
    notifications.show({ color: "green", message: "Settings saved" });
    navigate("/");
  }

  return (
    <Stack>
      <Title order={2}>Settings</Title>
      <form onSubmit={form.onSubmit(handleSave)} noValidate>
        <Stack>
          <TextInput
            label="API URL"
            placeholder="http://localhost:8000"
            key={form.key("apiUrl")}
            {...form.getInputProps("apiUrl")}
          />
          <PasswordInput
            label="API key"
            key={form.key("apiKey")}
            {...form.getInputProps("apiKey")}
          />
          {connection.status === "ok" && <Alert color="green">Connection works</Alert>}
          {connection.status === "error" && (
            <Alert color="red" title="Connection failed">
              {connection.message}
            </Alert>
          )}
          <Group grow>
            <Button
              variant="default"
              onClick={handleTestConnection}
              loading={connection.status === "checking"}
            >
              Test connection
            </Button>
            <Button type="submit">Save</Button>
          </Group>
        </Stack>
      </form>
      <Text size="xs" c="dimmed" ta="center">
        Version {__APP_VERSION__}
      </Text>
    </Stack>
  );
}

import { AppShell, Container, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { IconBuildingStore, IconSettings, IconTag } from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router";

const TABS = [
  {
    to: "/",
    label: "Products",
    Icon: IconTag,
    isActive: (path: string) => path === "/" || path.startsWith("/products"),
  },
  {
    to: "/domain-rules",
    label: "Shops",
    Icon: IconBuildingStore,
    isActive: (path: string) => path.startsWith("/domain-rules"),
  },
  {
    to: "/settings",
    label: "Settings",
    Icon: IconSettings,
    isActive: (path: string) => path.startsWith("/settings"),
  },
];

export function Layout() {
  const { pathname } = useLocation();

  return (
    <AppShell footer={{ height: 64 }} padding="md">
      <AppShell.Main>
        <Container size="xs" px={0} pb="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
      <AppShell.Footer>
        <nav aria-label="Main" style={{ height: "100%" }}>
          <Group grow gap={0} h="100%">
            {TABS.map(({ to, label, Icon, isActive }) => {
              const active = isActive(pathname);
              return (
                <UnstyledButton
                  key={to}
                  component={Link}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  c={active ? "blue" : "dimmed"}
                >
                  <Stack gap={2} align="center">
                    <Icon size={22} />
                    <Text size="xs">{label}</Text>
                  </Stack>
                </UnstyledButton>
              );
            })}
          </Group>
        </nav>
      </AppShell.Footer>
      <Notifications position="top-center" />
    </AppShell>
  );
}

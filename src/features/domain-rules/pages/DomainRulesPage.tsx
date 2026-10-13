import { ActionIcon, Button, Card, Center, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import type { DomainRule } from "../../../api/types";
import { ErrorState } from "../../../shared/components/ErrorState";
import { confirmDelete } from "../../../shared/confirm";
import { notifyError } from "../../../shared/notify";
import { DomainRuleDrawer, type DomainRuleDrawerState } from "../components/DomainRuleDrawer";
import { useDeleteDomainRule, useDomainRules } from "../queries";

export function DomainRulesPage() {
  const rules = useDomainRules();
  const deleteRule = useDeleteDomainRule();
  const [drawer, setDrawer] = useState<DomainRuleDrawerState>({ open: false });

  function handleDelete(rule: DomainRule) {
    confirmDelete({
      title: "Delete shop rule?",
      message: `Products from ${rule.domain} will use automatic price detection only.`,
      onConfirm: () => deleteRule.mutate(rule.id, { onError: notifyError }),
    });
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Shops</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          onClick={() => setDrawer({ open: true })}
        >
          Add shop
        </Button>
      </Group>

      {rules.isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : rules.isError ? (
        <ErrorState error={rules.error} onRetry={() => void rules.refetch()} />
      ) : rules.data.items.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No shop rules. Add one to set a currency or a price selector for a shop.
        </Text>
      ) : (
        <Stack gap="sm">
          {rules.data.items.map((rule) => (
            <Card key={rule.id} withBorder radius="md" padding="sm" aria-label={rule.domain}>
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2} miw={0}>
                  <Text fw={600} truncate>
                    {rule.domain}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {rule.currency || "Currency not set"}
                    {rule.price_selector && ` · ${rule.price_selector}`}
                  </Text>
                </Stack>
                <Group gap={4} wrap="nowrap">
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Edit ${rule.domain}`}
                    onClick={() => setDrawer({ open: true, rule })}
                  >
                    <IconPencil size={18} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Delete ${rule.domain}`}
                    onClick={() => handleDelete(rule)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <DomainRuleDrawer state={drawer} onClose={() => setDrawer({ open: false })} />
    </Stack>
  );
}

import { Group, Stack, Text } from "@mantine/core";
import type { PriceChange } from "../../../api/types";
import { formatDateTime } from "../../../shared/dates";
import { formatMoney } from "../../../shared/money";

export function HistoryList({
  history,
  currency,
}: {
  history: PriceChange[];
  currency: string | null;
}) {
  return (
    <Stack
      gap={0}
      component="ul"
      p={0}
      m={0}
      style={{ listStyle: "none" }}
      aria-label="Price changes"
    >
      {history.map((change) => (
        <Group
          key={change.id}
          component="li"
          justify="space-between"
          py="xs"
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
        >
          <Text size="sm">
            {change.old_price === null
              ? `First price: ${formatMoney(change.new_price, currency)}`
              : `${formatMoney(change.old_price, currency)} → ${formatMoney(change.new_price, currency)}`}
          </Text>
          <Text size="xs" c="dimmed">
            {formatDateTime(change.detected_at)}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}

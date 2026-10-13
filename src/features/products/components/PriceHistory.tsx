import { Loader, Stack, Text, Title } from "@mantine/core";
import { ErrorState } from "../../../shared/components/ErrorState";
import { useProductHistory } from "../queries";
import { HistoryList } from "./HistoryList";
import { PriceChart } from "./PriceChart";

export function PriceHistory({
  productId,
  currency,
}: {
  productId: number;
  currency: string | null;
}) {
  const history = useProductHistory(productId);

  return (
    <Stack gap="xs">
      <Title order={4}>Price history</Title>
      {history.isPending ? (
        <Loader size="sm" />
      ) : history.isError ? (
        <ErrorState error={history.error} onRetry={() => void history.refetch()} />
      ) : history.data.items.length === 0 ? (
        <Text size="sm" c="dimmed">
          No prices recorded yet.
        </Text>
      ) : (
        <>
          {history.data.items.length >= 2 && <PriceChart history={history.data.items} />}
          <HistoryList history={history.data.items} currency={currency} />
        </>
      )}
    </Stack>
  );
}

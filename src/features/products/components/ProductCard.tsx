import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { Link } from "react-router";
import type { Product } from "../../../api/types";
import { CheckStatusBadge } from "../../../shared/components/CheckStatusBadge";
import { formatMoney, isTargetReached } from "../../../shared/money";
import { productTitle } from "../productTitle";

export function ProductCard({ product }: { product: Product }) {
  const targetReached = isTargetReached(product.current_price, product.target_price);

  return (
    <Card
      component={Link}
      to={`/products/${product.id}`}
      withBorder
      radius="md"
      padding="sm"
      aria-label={productTitle(product)}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={2} miw={0}>
          <Text fw={600} truncate>
            {productTitle(product)}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {product.domain}
          </Text>
        </Stack>
        <CheckStatusBadge status={product.last_check_status} />
      </Group>
      <Group justify="space-between" mt="xs">
        <Text fw={700} size="lg">
          {product.current_price
            ? formatMoney(product.current_price, product.currency)
            : "No price yet"}
        </Text>
        <Group gap="xs">
          {!product.is_active && (
            <Badge color="gray" variant="outline">
              Paused
            </Badge>
          )}
          {targetReached && <Badge color="teal">Target reached</Badge>}
        </Group>
      </Group>
    </Card>
  );
}

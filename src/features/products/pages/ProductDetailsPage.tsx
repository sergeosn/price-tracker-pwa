import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconDots,
  IconExternalLink,
  IconPencil,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { isApiError } from "../../../api/errors";
import type { Product } from "../../../api/types";
import { CheckStatusBadge } from "../../../shared/components/CheckStatusBadge";
import { ErrorState } from "../../../shared/components/ErrorState";
import { confirmDelete } from "../../../shared/confirm";
import { formatDateTime } from "../../../shared/dates";
import { formatMoney, isTargetReached } from "../../../shared/money";
import { notifyError } from "../../../shared/notify";
import { describeCheckResult } from "../checkResult";
import { EditProductDrawer } from "../components/EditProductDrawer";
import { PriceHistory } from "../components/PriceHistory";
import { productTitle } from "../productTitle";
import { useCheckProduct, useDeleteProduct, useProduct } from "../queries";

export function ProductDetailsPage() {
  const productId = Number(useParams().productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return <ProductNotFound />;
  }
  return <ProductScreen productId={productId} />;
}

function ProductNotFound({ error }: { error?: unknown }) {
  return (
    <ErrorState
      title="Product not found"
      error={error ?? new Error("This product does not exist.")}
    >
      <Anchor component={Link} to="/" size="sm">
        Back to products
      </Anchor>
    </ErrorState>
  );
}

function ProductScreen({ productId }: { productId: number }) {
  const product = useProduct(productId);

  if (product.isPending) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }
  if (product.isError) {
    if (isApiError(product.error) && product.error.kind === "not_found") {
      return <ProductNotFound error={product.error} />;
    }
    return <ErrorState error={product.error} onRetry={() => void product.refetch()} />;
  }
  return <ProductDetails product={product.data} />;
}

function ProductDetails({ product }: { product: Product }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const checkProduct = useCheckProduct(product.id);
  const deleteProduct = useDeleteProduct();
  const targetReached = isTargetReached(product.current_price, product.target_price);

  function handleCheck() {
    const previousPrice = product.current_price;
    checkProduct.mutate(undefined, {
      onSuccess: ({ result, product: checked }) =>
        notifications.show(describeCheckResult(result, previousPrice, checked.currency)),
      onError: notifyError,
    });
  }

  function handleDelete() {
    confirmDelete({
      title: "Delete product?",
      message: `Stop tracking "${productTitle(product)}" and delete its price history?`,
      onConfirm: () =>
        deleteProduct.mutate(product.id, {
          onSuccess: () => navigate("/", { replace: true }),
          onError: notifyError,
        }),
    });
  }

  return (
    <Stack>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Group gap="xs" wrap="nowrap" miw={0}>
          <ActionIcon component={Link} to="/" variant="subtle" aria-label="Back to products">
            <IconArrowLeft />
          </ActionIcon>
          <Title order={2} lineClamp={2}>
            {productTitle(product)}
          </Title>
        </Group>
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" aria-label="Product actions">
              <IconDots />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => setEditing(true)}>
              Edit
            </Menu.Item>
            <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={handleDelete}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Anchor href={product.url} target="_blank" rel="noopener noreferrer" size="sm">
        <Group gap={4} wrap="nowrap">
          <Text span inherit truncate>
            {product.domain}
          </Text>
          <IconExternalLink size={14} />
        </Group>
      </Anchor>

      <Card withBorder radius="md">
        <Stack gap="xs">
          <Text size="xl" fw={700}>
            {product.current_price
              ? formatMoney(product.current_price, product.currency)
              : "No price yet"}
          </Text>
          {product.target_price && (
            <Group gap="xs">
              <Text size="sm">Target: {formatMoney(product.target_price, product.currency)}</Text>
              {targetReached && <Badge color="teal">Target reached</Badge>}
            </Group>
          )}
          <Group gap="xs">
            <CheckStatusBadge status={product.last_check_status} />
            {!product.is_active && (
              <Badge color="gray" variant="outline">
                Paused
              </Badge>
            )}
            <Text size="xs" c="dimmed">
              {product.last_checked_at
                ? `Checked ${formatDateTime(product.last_checked_at)}`
                : "Never checked"}
            </Text>
          </Group>
          {product.last_error && (
            <Alert color="yellow" title="Last check failed">
              {product.last_error}
            </Alert>
          )}
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={handleCheck}
            loading={checkProduct.isPending}
          >
            Check now
          </Button>
        </Stack>
      </Card>

      <PriceHistory productId={product.id} currency={product.currency} />
      <EditProductDrawer product={product} opened={editing} onClose={() => setEditing(false)} />
    </Stack>
  );
}

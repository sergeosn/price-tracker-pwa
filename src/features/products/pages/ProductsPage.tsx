import {
  ActionIcon,
  Affix,
  Button,
  Center,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router";
import { ErrorState } from "../../../shared/components/ErrorState";
import { ProductCard } from "../components/ProductCard";
import { useProducts, type ProductFilter } from "../queries";

const FILTERS: { label: string; value: ProductFilter }[] = [
  { label: "All", value: "all" },
  { label: "Errors", value: "errors" },
  { label: "Paused", value: "paused" },
];

export function ProductsPage() {
  const [filter, setFilter] = useState<ProductFilter>("all");
  const products = useProducts(filter);
  const items = products.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Stack>
      <Title order={2}>Products</Title>
      <SegmentedControl<ProductFilter>
        fullWidth
        value={filter}
        onChange={setFilter}
        data={FILTERS}
      />

      {products.isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : products.isError ? (
        <ErrorState error={products.error} onRetry={() => void products.refetch()} />
      ) : items.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {filter === "all" ? "No products yet. Tap + to add one." : "Nothing here."}
        </Text>
      ) : (
        <Stack gap="sm">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Stack>
      )}

      {products.hasNextPage && (
        <Button
          variant="light"
          onClick={() => void products.fetchNextPage()}
          loading={products.isFetchingNextPage}
        >
          Load more
        </Button>
      )}

      <Affix position={{ bottom: 80, right: 16 }}>
        <ActionIcon
          component={Link}
          to="/products/new"
          size={56}
          radius="xl"
          aria-label="Add product"
        >
          <IconPlus />
        </ActionIcon>
      </Affix>
    </Stack>
  );
}

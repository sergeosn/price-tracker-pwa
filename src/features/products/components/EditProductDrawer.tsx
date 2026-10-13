import { Button, Drawer, Stack, Switch, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { Product } from "../../../api/types";
import { handleFormError } from "../../../shared/forms";
import { useUpdateProduct } from "../queries";
import {
  buildProductUpdate,
  editProductSchema,
  toEditProductValues,
  type EditProductFormValues,
} from "../schemas";

interface EditProductDrawerProps {
  product: Product;
  opened: boolean;
  onClose: () => void;
}

export function EditProductDrawer({ product, opened, onClose }: EditProductDrawerProps) {
  return (
    <Drawer opened={opened} onClose={onClose} title="Edit product" position="bottom" size="auto">
      {/* Mounted only while open, so the form always starts from the latest product data. */}
      {opened && <EditProductForm product={product} onDone={onClose} />}
    </Drawer>
  );
}

function EditProductForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const updateProduct = useUpdateProduct(product.id);
  const form = useForm<EditProductFormValues>({
    mode: "uncontrolled",
    initialValues: toEditProductValues(product),
    validate: schemaResolver(editProductSchema, { sync: true }),
  });

  async function handleSubmit(values: EditProductFormValues) {
    const changes = buildProductUpdate(product, values);
    if (Object.keys(changes).length === 0) {
      onDone();
      return;
    }
    // Awaited rather than mutate() callbacks: those are skipped once the drawer is closed, and the
    // user must still learn that the save failed.
    try {
      await updateProduct.mutateAsync(changes);
      notifications.show({ color: "green", message: "Product updated" });
      onDone();
    } catch (error) {
      handleFormError(error, form.setErrors);
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack>
        <TextInput label="Name" key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput
          label="Target price"
          inputMode="decimal"
          key={form.key("target_price")}
          {...form.getInputProps("target_price")}
        />
        <TextInput
          label="CSS price selector"
          description="Changing it re-checks the price."
          key={form.key("price_selector")}
          {...form.getInputProps("price_selector")}
        />
        <Switch
          label="Tracking"
          description="Paused products are skipped by the scheduled check."
          key={form.key("is_active")}
          {...form.getInputProps("is_active", { type: "checkbox" })}
        />
        <Button type="submit" loading={updateProduct.isPending}>
          Save
        </Button>
      </Stack>
    </form>
  );
}

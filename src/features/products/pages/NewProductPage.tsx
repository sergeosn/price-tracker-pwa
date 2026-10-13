import { Accordion, ActionIcon, Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router";
import { handleFormError } from "../../../shared/forms";
import { useCreateProduct } from "../queries";
import {
  emptyNewProduct,
  newProductSchema,
  toProductCreate,
  type NewProductFormValues,
} from "../schemas";

export function NewProductPage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const form = useForm<NewProductFormValues>({
    mode: "uncontrolled",
    initialValues: emptyNewProduct,
    validate: schemaResolver(newProductSchema, { sync: true }),
  });

  function handleSubmit(values: NewProductFormValues) {
    createProduct.mutate(toProductCreate(values), {
      onSuccess: (product) => navigate(`/products/${product.id}`, { replace: true }),
      onError: (error) =>
        handleFormError(error, form.setErrors, {
          field: "url",
          message: "This product is already being tracked",
        }),
    });
  }

  return (
    <Stack>
      <Group gap="xs">
        <ActionIcon component={Link} to="/" variant="subtle" aria-label="Back to products">
          <IconArrowLeft />
        </ActionIcon>
        <Title order={2}>Add product</Title>
      </Group>
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack>
          <TextInput
            label="Product URL"
            withAsterisk
            placeholder="https://"
            inputMode="url"
            key={form.key("url")}
            {...form.getInputProps("url")}
          />
          <TextInput
            label="Name"
            description="Optional. The shop domain is shown when empty."
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Target price"
            description="Optional. Products at or below it are marked."
            inputMode="decimal"
            key={form.key("target_price")}
            {...form.getInputProps("target_price")}
          />
          <Accordion variant="contained">
            <Accordion.Item value="advanced">
              <Accordion.Control>Advanced</Accordion.Control>
              <Accordion.Panel>
                <TextInput
                  label="CSS price selector"
                  description="Only for pages where the price is not found automatically."
                  key={form.key("price_selector")}
                  {...form.getInputProps("price_selector")}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <Button type="submit" loading={createProduct.isPending}>
            Add and check price
          </Button>
          {createProduct.isPending && (
            <Text size="xs" c="dimmed" ta="center">
              Checking the price can take a few seconds…
            </Text>
          )}
        </Stack>
      </form>
    </Stack>
  );
}

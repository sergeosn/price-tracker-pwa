import { Button, Drawer, Stack, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { DomainRule } from "../../../api/types";
import { handleFormError } from "../../../shared/forms";
import { useCreateDomainRule, useUpdateDomainRule } from "../queries";
import {
  domainRuleSchema,
  toDomainRuleBody,
  toDomainRuleValues,
  type DomainRuleFormValues,
} from "../schemas";

/** `rule` undefined = create a new rule; otherwise edit it. */
export type DomainRuleDrawerState = { open: false } | { open: true; rule?: DomainRule };

interface DomainRuleDrawerProps {
  state: DomainRuleDrawerState;
  onClose: () => void;
}

export function DomainRuleDrawer({ state, onClose }: DomainRuleDrawerProps) {
  const title = state.open && state.rule ? "Edit shop" : "Add shop";
  return (
    <Drawer opened={state.open} onClose={onClose} title={title} position="bottom" size="auto">
      {state.open && <DomainRuleForm rule={state.rule} onDone={onClose} />}
    </Drawer>
  );
}

function DomainRuleForm({ rule, onDone }: { rule?: DomainRule; onDone: () => void }) {
  const createRule = useCreateDomainRule();
  const updateRule = useUpdateDomainRule();
  const form = useForm<DomainRuleFormValues>({
    mode: "uncontrolled",
    initialValues: toDomainRuleValues(rule),
    validate: schemaResolver(domainRuleSchema, { sync: true }),
  });

  function handleSubmit(values: DomainRuleFormValues) {
    const body = toDomainRuleBody(values);
    const callbacks = {
      onSuccess: () => {
        notifications.show({ color: "green", message: rule ? "Shop updated" : "Shop added" });
        onDone();
      },
      onError: (error: unknown) =>
        handleFormError(error, form.setErrors, {
          field: "domain",
          message: "A rule for this domain already exists",
        }),
    };
    if (rule) {
      updateRule.mutate({ id: rule.id, body }, callbacks);
    } else {
      createRule.mutate(body, callbacks);
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack>
        <TextInput
          label="Domain"
          withAsterisk
          placeholder="amazon.ca"
          key={form.key("domain")}
          {...form.getInputProps("domain")}
        />
        <TextInput
          label="Currency"
          description="ISO 4217 code. Leave empty to detect it from the shop's pages."
          maxLength={3}
          key={form.key("currency")}
          {...form.getInputProps("currency")}
        />
        <TextInput
          label="CSS price selector"
          description="Used when a page has no structured price data."
          key={form.key("price_selector")}
          {...form.getInputProps("price_selector")}
        />
        <Button type="submit" loading={createRule.isPending || updateRule.isPending}>
          Save
        </Button>
      </Stack>
    </form>
  );
}

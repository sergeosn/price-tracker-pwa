import { z } from "zod";
import type { DomainRule, DomainRuleCreate } from "../../api/types";

export const domainRuleSchema = z.object({
  domain: z.string().trim().min(1, "Enter the shop domain, e.g. amazon.ca").max(255),
  currency: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[A-Za-z]{3}$/.test(value), {
      error: "Use a 3-letter ISO code, e.g. USD",
    }),
  price_selector: z.string().trim().max(500),
});

export type DomainRuleFormValues = z.input<typeof domainRuleSchema>;

export function toDomainRuleValues(rule?: DomainRule): DomainRuleFormValues {
  return {
    domain: rule?.domain ?? "",
    currency: rule?.currency ?? "",
    price_selector: rule?.price_selector ?? "",
  };
}

/** Same body for create and update: the rule form always edits all three fields. */
export function toDomainRuleBody(values: DomainRuleFormValues): DomainRuleCreate {
  return {
    domain: values.domain.trim(),
    currency: values.currency.trim().toUpperCase(),
    price_selector: values.price_selector.trim(),
  };
}

import { z } from "zod";
import type { Product, ProductCreate, ProductUpdate } from "../../api/types";
import { toCents } from "../../shared/money";
import { httpUrlSchema, optionalPriceSchema } from "../../shared/validation";

export const newProductSchema = z.object({
  url: httpUrlSchema("Enter the product page URL (http or https)"),
  name: z.string().trim().max(255),
  target_price: optionalPriceSchema,
  price_selector: z.string().trim().max(500),
});

export type NewProductFormValues = z.input<typeof newProductSchema>;

export const emptyNewProduct: NewProductFormValues = {
  url: "",
  name: "",
  target_price: "",
  price_selector: "",
};

export function toProductCreate(values: NewProductFormValues): ProductCreate {
  const targetPrice = values.target_price.trim();
  return {
    url: values.url.trim(),
    name: values.name.trim(),
    price_selector: values.price_selector.trim(),
    target_price: targetPrice === "" ? null : targetPrice,
    is_active: true,
    check_now: true,
  };
}

export const editProductSchema = z.object({
  name: z.string().trim().max(255),
  target_price: optionalPriceSchema,
  price_selector: z.string().trim().max(500),
  is_active: z.boolean(),
});

export type EditProductFormValues = z.input<typeof editProductSchema>;

export function toEditProductValues(product: Product): EditProductFormValues {
  return {
    name: product.name,
    target_price: product.target_price ?? "",
    price_selector: product.price_selector,
    is_active: product.is_active,
  };
}

function samePrice(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return a === b;
  return toCents(a) === toCents(b);
}

/**
 * Only the fields that actually changed. The backend re-checks the price whenever
 * `price_selector` is present, so unchanged fields must not be sent.
 */
export function buildProductUpdate(product: Product, values: EditProductFormValues): ProductUpdate {
  const update: ProductUpdate = {};
  const name = values.name.trim();
  const selector = values.price_selector.trim();
  const target = values.target_price.trim() === "" ? null : values.target_price.trim();

  if (name !== product.name) update.name = name;
  if (selector !== product.price_selector) update.price_selector = selector;
  if (!samePrice(target, product.target_price)) update.target_price = target;
  if (values.is_active !== product.is_active) update.is_active = values.is_active;
  return update;
}

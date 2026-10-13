import type { Product } from "../../api/types";

/** Products without a name are shown by their shop domain. */
export function productTitle(product: Pick<Product, "name" | "domain">): string {
  return product.name || product.domain;
}

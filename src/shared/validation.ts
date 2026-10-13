import { z } from "zod";
import { toCents } from "./money";

/** Optional price typed by the user: "" (no price) or a positive amount with up to 2 decimals. */
export const optionalPriceSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{1,10}(\.\d{1,2})?$/.test(value), {
    error: "Enter a price like 1299 or 1299.99",
    // zod 4 runs later refinements even after a failure; stop before toCents() sees bad input.
    abort: true,
  })
  .refine((value) => value === "" || toCents(value) > 0, {
    error: "Price must be greater than zero",
  });

export const httpUrlSchema = (message: string) =>
  z
    .string()
    .trim()
    .pipe(z.url({ protocol: /^https?$/, error: message }));

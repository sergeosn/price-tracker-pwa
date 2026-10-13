import type { CheckResult } from "../../api/types";
import { formatMoney, type Money } from "../../shared/money";

/** A type alias so it can be passed straight to `notifications.show()`. */
export type CheckResultMessage = {
  color: "green" | "blue" | "yellow";
  title: string;
  message: string;
};

/** Text of the notification shown after "Check now". `previousPrice` is the price before the check. */
export function describeCheckResult(
  result: CheckResult,
  previousPrice: Money | null,
  currency: string | null,
  locale?: string,
): CheckResultMessage {
  if (result.status === "error") {
    return {
      color: "yellow",
      title: "Couldn't get the price",
      message: result.error ?? "Unknown error",
    };
  }
  const price = result.price === null ? "—" : formatMoney(result.price, currency, locale);
  if (result.changed) {
    const before = previousPrice === null ? "—" : formatMoney(previousPrice, currency, locale);
    return { color: "green", title: "Price changed", message: `${before} → ${price}` };
  }
  return { color: "blue", title: "No change", message: `Current price: ${price}` };
}

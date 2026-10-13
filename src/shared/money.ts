/** A decimal amount as the API sends it: digits with up to two decimals, e.g. "1299.00". */
export type Money = string;

const MONEY_PATTERN = /^(\d+)(?:\.(\d{1,2}))?$/;

/** Converts a Money string to integer cents. Throws RangeError for malformed input. */
export function toCents(value: Money): number {
  const match = MONEY_PATTERN.exec(value.trim());
  if (!match) {
    throw new RangeError(`Not a valid amount: "${value}"`);
  }
  const [, whole = "0", fraction = ""] = match;
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function isTargetReached(current: Money | null, target: Money | null): boolean {
  if (current === null || target === null) {
    return false;
  }
  return toCents(current) <= toCents(target);
}

/** Formats an amount with its ISO 4217 currency, or as a plain number when the currency is unknown. */
export function formatMoney(value: Money, currency: string | null, locale?: string): string {
  const format = new Intl.NumberFormat(
    locale,
    currency
      ? { style: "currency", currency }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  );
  return format.format(Number(value));
}

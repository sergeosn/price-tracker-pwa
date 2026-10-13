import type { DomainRule, Page, PriceChange, Product } from "../api/types";

let nextId = 1000;

export function makeProduct(overrides: Partial<Product> = {}): Product {
  const id = overrides.id ?? nextId++;
  return {
    id,
    url: `https://shop.example/item/${id}`,
    domain: "shop.example",
    name: `Product ${id}`,
    price_selector: "",
    target_price: null,
    currency: "USD",
    current_price: "1299.00",
    is_active: true,
    last_checked_at: "2026-10-13T09:00:00Z",
    last_check_status: "ok",
    last_error: "",
    created_at: "2026-10-01T09:00:00Z",
    updated_at: "2026-10-13T09:00:00Z",
    ...overrides,
  };
}

export function makePriceChange(overrides: Partial<PriceChange> = {}): PriceChange {
  return {
    id: overrides.id ?? nextId++,
    old_price: "1399.00",
    new_price: "1299.00",
    detected_at: "2026-10-13T09:00:00Z",
    ...overrides,
  };
}

export function makeDomainRule(overrides: Partial<DomainRule> = {}): DomainRule {
  return {
    id: overrides.id ?? nextId++,
    domain: "shop.example",
    currency: "USD",
    price_selector: "",
    created_at: "2026-10-01T09:00:00Z",
    updated_at: "2026-10-01T09:00:00Z",
    ...overrides,
  };
}

export function page<T>(
  items: T[],
  { total = items.length, limit = 50, offset = 0 }: Partial<Omit<Page<T>, "items">> = {},
): Page<T> {
  return { items, total, limit, offset };
}

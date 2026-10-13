import { describe, expect, it } from "vitest";
import { makeDomainRule } from "../../test/factories";
import { domainRuleSchema, toDomainRuleBody, toDomainRuleValues } from "./schemas";

describe("domainRuleSchema", () => {
  it("requires a domain", () => {
    expect(
      domainRuleSchema.safeParse({ domain: " ", currency: "", price_selector: "" }).success,
    ).toBe(false);
  });

  it.each(["", "usd", "UAH"])("accepts currency %j", (currency) => {
    expect(
      domainRuleSchema.safeParse({ domain: "a.example", currency, price_selector: "" }).success,
    ).toBe(true);
  });

  it.each(["US", "USDT", "$"])("rejects currency %j", (currency) => {
    expect(
      domainRuleSchema.safeParse({ domain: "a.example", currency, price_selector: "" }).success,
    ).toBe(false);
  });
});

describe("toDomainRuleBody", () => {
  it("trims values and upper-cases the currency", () => {
    expect(
      toDomainRuleBody({ domain: " amazon.ca ", currency: "cad", price_selector: " span.price " }),
    ).toEqual({ domain: "amazon.ca", currency: "CAD", price_selector: "span.price" });
  });
});

describe("toDomainRuleValues", () => {
  it("starts empty for a new rule and copies an existing one", () => {
    expect(toDomainRuleValues()).toEqual({ domain: "", currency: "", price_selector: "" });
    const rule = makeDomainRule({ domain: "a.example", currency: "EUR", price_selector: "b" });
    expect(toDomainRuleValues(rule)).toEqual({
      domain: "a.example",
      currency: "EUR",
      price_selector: "b",
    });
  });
});

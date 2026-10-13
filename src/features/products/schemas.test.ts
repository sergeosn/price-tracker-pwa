import { describe, expect, it } from "vitest";
import { makeProduct } from "../../test/factories";
import {
  buildProductUpdate,
  newProductSchema,
  toEditProductValues,
  toProductCreate,
} from "./schemas";

describe("newProductSchema", () => {
  const valid = { url: "https://shop.example/p/1", name: "", target_price: "", price_selector: "" };

  it("accepts a URL with optional fields empty", () => {
    expect(newProductSchema.safeParse(valid).success).toBe(true);
  });

  it.each(["shop.example/p/1", "ftp://shop.example/p/1", ""])("rejects URL %j", (url) => {
    expect(newProductSchema.safeParse({ ...valid, url }).success).toBe(false);
  });

  it.each(["0", "0.00", "12.345", "-1", "abc", "1,5"])("rejects target price %j", (price) => {
    expect(newProductSchema.safeParse({ ...valid, target_price: price }).success).toBe(false);
  });

  it.each(["1299", "1299.9", "1299.99", " 15 "])("accepts target price %j", (price) => {
    expect(newProductSchema.safeParse({ ...valid, target_price: price }).success).toBe(true);
  });
});

describe("toProductCreate", () => {
  it("trims values, turns an empty price into null and checks immediately", () => {
    expect(
      toProductCreate({
        url: " https://shop.example/p/1 ",
        name: " Phone ",
        target_price: "",
        price_selector: " span.price ",
      }),
    ).toEqual({
      url: "https://shop.example/p/1",
      name: "Phone",
      price_selector: "span.price",
      target_price: null,
      is_active: true,
      check_now: true,
    });
  });

  it("keeps the price as a string", () => {
    const body = toProductCreate({
      url: "https://a.example",
      name: "",
      target_price: "35000",
      price_selector: "",
    });
    expect(body.target_price).toBe("35000");
  });
});

describe("buildProductUpdate", () => {
  const product = makeProduct({
    name: "Phone",
    target_price: "1000.00",
    price_selector: "",
    is_active: true,
  });

  it("returns an empty update when nothing changed", () => {
    expect(buildProductUpdate(product, toEditProductValues(product))).toEqual({});
  });

  it("treats 1000 and 1000.00 as the same price", () => {
    const values = { ...toEditProductValues(product), target_price: "1000" };
    expect(buildProductUpdate(product, values)).toEqual({});
  });

  it("includes only changed fields", () => {
    const values = { ...toEditProductValues(product), name: "Phone 15", is_active: false };
    expect(buildProductUpdate(product, values)).toEqual({ name: "Phone 15", is_active: false });
  });

  it("clears the target price with null", () => {
    const values = { ...toEditProductValues(product), target_price: "" };
    expect(buildProductUpdate(product, values)).toEqual({ target_price: null });
  });

  it("sends a changed selector", () => {
    const values = { ...toEditProductValues(product), price_selector: "span.price" };
    expect(buildProductUpdate(product, values)).toEqual({ price_selector: "span.price" });
  });
});

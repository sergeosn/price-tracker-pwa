import type { components } from "./schema";

type Schemas = components["schemas"];

export type Product = Schemas["ProductOut"];
export type ProductCreate = Schemas["ProductCreate"];
export type ProductUpdate = Schemas["ProductUpdate"];
export type PriceChange = Schemas["PriceChangeOut"];
export type CheckResult = Schemas["CheckResultOut"];
export type CheckResponse = Schemas["CheckResponse"];
export type DomainRule = Schemas["DomainRuleOut"];
export type DomainRuleCreate = Schemas["DomainRuleCreate"];
export type DomainRuleUpdate = Schemas["DomainRuleUpdate"];
export type CheckStatus = Product["last_check_status"];

export type Page<T> = { items: T[]; total: number; limit: number; offset: number };

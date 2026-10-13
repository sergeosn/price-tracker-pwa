import { screen, within } from "@testing-library/react";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";
import type { DomainRule } from "../../../api/types";
import { makeDomainRule, page } from "../../../test/factories";
import { renderApp } from "../../../test/render";
import { apiPath, server } from "../../../test/server";

/** Serves a mutable in-memory list, so a refetch after a mutation shows the new state. */
function serveRules(initial: DomainRule[]) {
  let rules = [...initial];
  server.use(http.get(apiPath("/api/v1/domain-rules"), () => HttpResponse.json(page(rules))));
  return {
    set: (next: DomainRule[]) => {
      rules = next;
    },
  };
}

describe("DomainRulesPage", () => {
  it("lists rules", async () => {
    serveRules([
      makeDomainRule({ domain: "amazon.ca", currency: "CAD", price_selector: "span.p" }),
    ]);
    renderApp({ route: "/domain-rules" });

    const card = await screen.findByLabelText("amazon.ca");
    expect(within(card).getByText("CAD · span.p")).toBeInTheDocument();
  });

  it("adds a rule", async () => {
    const store = serveRules([]);
    let body: unknown;
    server.use(
      http.post(apiPath("/api/v1/domain-rules"), async ({ request }) => {
        body = await request.json();
        const rule = makeDomainRule({ domain: "amazon.ca", currency: "CAD" });
        store.set([rule]);
        return HttpResponse.json(rule, { status: 201 });
      }),
    );
    const { user } = renderApp({ route: "/domain-rules" });

    await user.click(await screen.findByRole("button", { name: "Add shop" }));
    await user.type(screen.getByLabelText(/Domain/), "amazon.ca");
    await user.type(screen.getByLabelText("Currency"), "cad");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByLabelText("amazon.ca")).toBeInTheDocument();
    expect(body).toEqual({ domain: "amazon.ca", currency: "CAD", price_selector: "" });
  });

  it("shows a duplicate domain under the domain field", async () => {
    serveRules([]);
    server.use(
      http.post(apiPath("/api/v1/domain-rules"), () =>
        HttpResponse.json({ detail: "Domain rule already exists" }, { status: 409 }),
      ),
    );
    const { user } = renderApp({ route: "/domain-rules" });

    await user.click(await screen.findByRole("button", { name: "Add shop" }));
    await user.type(screen.getByLabelText(/Domain/), "amazon.ca");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("A rule for this domain already exists")).toBeInTheDocument();
  });

  it("shows backend validation errors on the fields", async () => {
    serveRules([]);
    server.use(
      http.post(apiPath("/api/v1/domain-rules"), () =>
        HttpResponse.json(
          {
            detail: [
              {
                loc: ["body", "currency"],
                msg: "Unknown ISO 4217 currency code",
                type: "value_error",
              },
            ],
          },
          { status: 422 },
        ),
      ),
    );
    const { user } = renderApp({ route: "/domain-rules" });

    await user.click(await screen.findByRole("button", { name: "Add shop" }));
    await user.type(screen.getByLabelText(/Domain/), "amazon.ca");
    await user.type(screen.getByLabelText("Currency"), "XYZ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Unknown ISO 4217 currency code")).toBeInTheDocument();
  });

  it("edits a rule", async () => {
    const rule = makeDomainRule({ id: 5, domain: "amazon.ca", currency: "CAD" });
    serveRules([rule]);
    let body: unknown;
    server.use(
      http.patch(apiPath("/api/v1/domain-rules/5"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ...rule, currency: "USD" });
      }),
    );
    const { user } = renderApp({ route: "/domain-rules" });

    await user.click(await screen.findByRole("button", { name: "Edit amazon.ca" }));
    const currency = screen.getByLabelText("Currency");
    await user.clear(currency);
    await user.type(currency, "usd");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Shop updated")).toBeInTheDocument();
    expect(body).toEqual({ domain: "amazon.ca", currency: "USD", price_selector: "" });
  });

  it("deletes a rule after confirmation", async () => {
    const store = serveRules([makeDomainRule({ id: 5, domain: "amazon.ca" })]);
    server.use(
      http.delete(apiPath("/api/v1/domain-rules/5"), () => {
        store.set([]);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = renderApp({ route: "/domain-rules" });

    await user.click(await screen.findByRole("button", { name: "Delete amazon.ca" }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(await screen.findByText(/No shop rules/)).toBeInTheDocument();
  });

  it("reports a failed save after the drawer was closed", async () => {
    serveRules([]);
    server.use(
      http.post(apiPath("/api/v1/domain-rules"), async () => {
        await delay(100);
        return HttpResponse.json({ detail: "Database unavailable" }, { status: 503 });
      }),
    );
    const { user } = renderApp({ route: "/domain-rules" });

    await user.click(await screen.findByRole("button", { name: "Add shop" }));
    await user.type(screen.getByLabelText(/Domain/), "amazon.ca");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(await screen.findByText("Request failed")).toBeInTheDocument();
  });
});

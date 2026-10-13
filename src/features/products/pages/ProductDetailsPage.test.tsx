import { screen, within } from "@testing-library/react";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";
import type { Product } from "../../../api/types";
import { makePriceChange, makeProduct, page } from "../../../test/factories";
import { renderApp } from "../../../test/render";
import { apiPath, server } from "../../../test/server";

const product = makeProduct({
  id: 7,
  name: "Phone",
  current_price: "1299.00",
  target_price: "1000.00",
  currency: "USD",
});

function serveProduct(overrides: Partial<Product> = {}) {
  let historyRequests = 0;
  server.use(
    http.get(apiPath("/api/v1/products/7"), () => HttpResponse.json({ ...product, ...overrides })),
    http.get(apiPath("/api/v1/products/7/history"), () => {
      historyRequests += 1;
      return HttpResponse.json(
        page([
          makePriceChange({ old_price: "1399.00", new_price: "1299.00" }),
          makePriceChange({ old_price: null, new_price: "1399.00" }),
        ]),
      );
    }),
  );
  return { historyRequests: () => historyRequests };
}

describe("ProductDetailsPage", () => {
  it("shows the product and its price history", async () => {
    serveProduct({ last_error: "Price not found on the page", last_check_status: "error" });
    renderApp({ route: "/products/7" });

    expect(await screen.findByRole("heading", { name: "Phone" })).toBeInTheDocument();
    expect(screen.getByText("Target: $1,000.00")).toBeInTheDocument();
    expect(screen.getByText("Price not found on the page")).toBeInTheDocument();
    const history = await screen.findByRole("list", { name: "Price changes" });
    expect(within(history).getByText("$1,399.00 → $1,299.00")).toBeInTheDocument();
    expect(within(history).getByText("First price: $1,399.00")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Price chart" })).toBeInTheDocument();
  });

  it("checks the price now and refreshes the history when it changed", async () => {
    const counter = serveProduct();
    server.use(
      http.post(apiPath("/api/v1/products/7/check"), () =>
        HttpResponse.json({
          result: { status: "ok", price: "1199.00", changed: true, error: null },
          product: { ...product, current_price: "1199.00" },
        }),
      ),
    );
    const { user } = renderApp({ route: "/products/7" });
    await screen.findByRole("list", { name: "Price changes" });

    await user.click(screen.getByRole("button", { name: "Check now" }));

    expect(await screen.findByText("$1,299.00 → $1,199.00")).toBeInTheDocument();
    expect(screen.getByText("Price changed")).toBeInTheDocument();
    await expect.poll(counter.historyRequests).toBe(2);
  });

  it("shows the backend message when the check fails", async () => {
    serveProduct();
    server.use(
      http.post(apiPath("/api/v1/products/7/check"), () =>
        HttpResponse.json({
          result: { status: "error", price: null, changed: false, error: "Currency mismatch" },
          product: { ...product, last_check_status: "error", last_error: "Currency mismatch" },
        }),
      ),
    );
    const { user } = renderApp({ route: "/products/7" });

    await user.click(await screen.findByRole("button", { name: "Check now" }));

    expect(await screen.findByText("Couldn't get the price")).toBeInTheDocument();
    expect(screen.getAllByText("Currency mismatch").length).toBeGreaterThan(0);
  });

  it("sends only changed fields when editing", async () => {
    serveProduct();
    let body: unknown;
    server.use(
      http.patch(apiPath("/api/v1/products/7"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ...product, target_price: "900.00" });
      }),
    );
    const { user } = renderApp({ route: "/products/7" });

    await user.click(await screen.findByRole("button", { name: "Product actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    const targetPrice = screen.getByLabelText("Target price");
    await user.clear(targetPrice);
    await user.type(targetPrice, "900");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Product updated")).toBeInTheDocument();
    expect(body).toEqual({ target_price: "900" });
    expect(await screen.findByText("Target: $900.00")).toBeInTheDocument();
  });

  it("deletes after confirmation and returns to the list", async () => {
    serveProduct();
    let deleted = false;
    server.use(
      http.delete(apiPath("/api/v1/products/7"), () => {
        deleted = true;
        return new HttpResponse(null, { status: 204 });
      }),
      http.get(apiPath("/api/v1/products"), () => HttpResponse.json(page([]))),
    );
    const { user, router } = renderApp({ route: "/products/7" });

    await user.click(await screen.findByRole("button", { name: "Product actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(await screen.findByText("No products yet. Tap + to add one.")).toBeInTheDocument();
    expect(deleted).toBe(true);
    expect(router.state.location.pathname).toBe("/");
  });

  it("shows not found for a missing product", async () => {
    server.use(
      http.get(apiPath("/api/v1/products/7"), () =>
        HttpResponse.json({ detail: "Product 7 not found" }, { status: 404 }),
      ),
      http.get(apiPath("/api/v1/products/7/history"), () =>
        HttpResponse.json({ detail: "Product 7 not found" }, { status: 404 }),
      ),
    );
    renderApp({ route: "/products/7" });

    expect(await screen.findByText("Product not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to products" })).toBeInTheDocument();
  });

  it("shows not found for a non-numeric id without calling the API", async () => {
    renderApp({ route: "/products/abc" });

    expect(await screen.findByText("Product not found")).toBeInTheDocument();
  });

  it("shows a single recorded price without a chart", async () => {
    server.use(
      http.get(apiPath("/api/v1/products/7"), () => HttpResponse.json(product)),
      http.get(apiPath("/api/v1/products/7/history"), () =>
        HttpResponse.json(page([makePriceChange({ old_price: null, new_price: "1299.00" })])),
      ),
    );
    renderApp({ route: "/products/7" });

    expect(await screen.findByText("First price: $1,299.00")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Price chart" })).not.toBeInTheDocument();
  });

  it("sends one check request even when Check now is tapped twice", async () => {
    serveProduct();
    let checks = 0;
    server.use(
      http.post(apiPath("/api/v1/products/7/check"), async () => {
        checks += 1;
        await delay(100);
        return HttpResponse.json({
          result: { status: "ok", price: "1299.00", changed: false, error: null },
          product,
        });
      }),
    );
    const { user } = renderApp({ route: "/products/7" });
    const button = await screen.findByRole("button", { name: "Check now" });

    await user.click(button);
    expect(button).toBeDisabled();
    await user.click(button);

    expect(await screen.findByText("No change")).toBeInTheDocument();
    expect(checks).toBe(1);
  });

  it("reports a failed save after the edit drawer was closed", async () => {
    serveProduct();
    server.use(
      http.patch(apiPath("/api/v1/products/7"), async () => {
        await delay(100);
        return HttpResponse.json({ detail: "Database unavailable" }, { status: 503 });
      }),
    );
    const { user } = renderApp({ route: "/products/7" });

    await user.click(await screen.findByRole("button", { name: "Product actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    await user.type(screen.getByLabelText("CSS price selector"), "span.price");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(await screen.findByText("Request failed")).toBeInTheDocument();
  });

  it("never shows the previous server's product after a check that was running during a switch", async () => {
    serveProduct();
    let oldCheckAnswered = false;
    server.use(
      http.post(apiPath("/api/v1/products/7/check"), async () => {
        await delay(300);
        oldCheckAnswered = true;
        return HttpResponse.json({
          result: { status: "ok", price: "1299.00", changed: false, error: null },
          product: { ...product, name: "Old server phone" },
        });
      }),
      http.get("http://other.test/api/v1/products", () =>
        HttpResponse.json(page([makeProduct({ id: 7, name: "New server phone" })])),
      ),
      http.get("http://other.test/api/v1/products/7", async () => {
        await delay(100);
        return HttpResponse.json(makeProduct({ id: 7, name: "New server phone" }));
      }),
      http.get("http://other.test/api/v1/products/7/history", () => HttpResponse.json(page([]))),
    );
    const { user } = renderApp({ route: "/products/7" });

    await user.click(await screen.findByRole("button", { name: "Check now" }));
    await user.click(screen.getByRole("link", { name: "Settings" }));
    const apiUrl = screen.getByLabelText("API URL");
    await user.clear(apiUrl);
    await user.type(apiUrl, "http://other.test");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await expect.poll(() => oldCheckAnswered).toBe(true);
    // Give a late response time to reach the cache before opening the product.
    await delay(50);
    await user.click(await screen.findByRole("link", { name: "New server phone" }));

    expect(screen.queryByRole("heading", { name: "Old server phone" })).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "New server phone" })).toBeInTheDocument();
  });
});

import { screen, within } from "@testing-library/react";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";
import { makeProduct, page } from "../../../test/factories";
import { renderApp } from "../../../test/render";
import { apiPath, server } from "../../../test/server";

describe("ProductsPage", () => {
  it("lists products with price, status and target marker", async () => {
    server.use(
      http.get(apiPath("/api/v1/products"), () =>
        HttpResponse.json(
          page([
            makeProduct({ name: "Phone", current_price: "900.00", target_price: "1000.00" }),
            makeProduct({ name: "", domain: "shop.example", last_check_status: "error" }),
          ]),
        ),
      ),
    );
    renderApp();

    const phone = await screen.findByRole("link", { name: "Phone" });
    expect(within(phone).getByText("$900.00")).toBeInTheDocument();
    expect(within(phone).getByText("Target reached")).toBeInTheDocument();
    const unnamed = screen.getByRole("link", { name: "shop.example" });
    expect(within(unnamed).getByText("Error")).toBeInTheDocument();
  });

  it("sends the filter to the API", async () => {
    const requests: string[] = [];
    server.use(
      http.get(apiPath("/api/v1/products"), ({ request }) => {
        requests.push(new URL(request.url).search);
        return HttpResponse.json(page([]));
      }),
    );
    const { user } = renderApp();
    await screen.findByText("No products yet. Tap + to add one.");

    await user.click(screen.getByText("Errors"));
    await screen.findByText("Nothing here.");
    await user.click(screen.getByText("Paused"));

    await expect
      .poll(() => requests)
      .toEqual([
        "?limit=50&offset=0",
        "?status=error&limit=50&offset=0",
        "?is_active=false&limit=50&offset=0",
      ]);
  });

  it("loads the next page on demand", async () => {
    server.use(
      http.get(apiPath("/api/v1/products"), ({ request }) => {
        const offset = Number(new URL(request.url).searchParams.get("offset"));
        return offset === 0
          ? HttpResponse.json(page([makeProduct({ name: "First" })], { total: 2 }))
          : HttpResponse.json(page([makeProduct({ name: "Second" })], { total: 2, offset: 1 }));
      }),
    );
    const { user } = renderApp();

    await user.click(await screen.findByRole("button", { name: "Load more" }));

    expect(await screen.findByRole("link", { name: "Second" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

  it("shows a network error with a retry button", async () => {
    server.use(http.get(apiPath("/api/v1/products"), () => HttpResponse.error()));
    renderApp();

    expect(
      await screen.findByText("Can't reach the server. Check the API URL in Settings."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("shows the invalid API key notification on 401", async () => {
    server.use(
      http.get(apiPath("/api/v1/products"), () =>
        HttpResponse.json({ detail: "Invalid or missing API key" }, { status: 401 }),
      ),
    );
    renderApp();

    expect(await screen.findByText("Update it in Settings")).toBeInTheDocument();
  });

  it("never shows the previous server's products after switching servers", async () => {
    server.use(
      http.get(apiPath("/api/v1/products"), () =>
        HttpResponse.json(page([makeProduct({ name: "Old server item" })])),
      ),
      http.get("http://other.test/api/v1/products", async () => {
        // Slow enough that stale cached data would still be on screen during the assertion.
        await delay(100);
        return HttpResponse.json(page([makeProduct({ name: "New server item" })]));
      }),
    );
    const { user } = renderApp();
    await screen.findByRole("link", { name: "Old server item" });

    await user.click(screen.getByRole("link", { name: "Settings" }));
    const apiUrl = screen.getByLabelText("API URL");
    await user.clear(apiUrl);
    await user.type(apiUrl, "http://other.test");
    await user.click(screen.getByRole("button", { name: "Save" }));

    // Checked before the new list arrives: cached data from the old server must be gone.
    expect(screen.queryByRole("link", { name: "Old server item" })).not.toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "New server item" })).toBeInTheDocument();
  });
});

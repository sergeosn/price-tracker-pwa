import { screen } from "@testing-library/react";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";
import { makeProduct, page } from "../../../test/factories";
import { renderApp } from "../../../test/render";
import { apiPath, server } from "../../../test/server";

describe("NewProductPage", () => {
  it("creates the product and opens its page", async () => {
    let body: unknown;
    server.use(
      http.post(apiPath("/api/v1/products"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(makeProduct({ id: 42, name: "Phone" }), { status: 201 });
      }),
      http.get(apiPath("/api/v1/products/42/history"), () => HttpResponse.json(page([]))),
    );
    const { user, router } = renderApp({ route: "/products/new" });

    await user.type(screen.getByLabelText(/Product URL/), "https://shop.example/p/1");
    await user.type(screen.getByLabelText("Target price"), "999.99");
    await user.click(screen.getByRole("button", { name: "Add and check price" }));

    expect(await screen.findByRole("heading", { name: "Phone" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/products/42");
    expect(body).toEqual({
      url: "https://shop.example/p/1",
      name: "",
      price_selector: "",
      target_price: "999.99",
      is_active: true,
      check_now: true,
    });
  });

  it("shows a duplicate URL under the URL field", async () => {
    server.use(
      http.post(apiPath("/api/v1/products"), () =>
        HttpResponse.json({ detail: "Product already exists" }, { status: 409 }),
      ),
    );
    const { user } = renderApp({ route: "/products/new" });

    await user.type(screen.getByLabelText(/Product URL/), "https://shop.example/p/1");
    await user.click(screen.getByRole("button", { name: "Add and check price" }));

    expect(await screen.findByText("This product is already being tracked")).toBeInTheDocument();
  });

  it("validates input before calling the API", async () => {
    // No handlers: any request would fail the test (onUnhandledRequest: "error").
    const { user } = renderApp({ route: "/products/new" });

    await user.type(screen.getByLabelText(/Product URL/), "shop.example/p/1");
    await user.type(screen.getByLabelText("Target price"), "0");
    await user.click(screen.getByRole("button", { name: "Add and check price" }));

    expect(
      await screen.findByText("Enter the product page URL (http or https)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Price must be greater than zero")).toBeInTheDocument();
  });

  it("shows only the invalid key notification when the key is rejected", async () => {
    server.use(
      http.post(apiPath("/api/v1/products"), () =>
        HttpResponse.json({ detail: "Invalid or missing API key" }, { status: 401 }),
      ),
    );
    const { user } = renderApp({ route: "/products/new" });

    await user.type(screen.getByLabelText(/Product URL/), "https://shop.example/p/1");
    await user.click(screen.getByRole("button", { name: "Add and check price" }));

    expect(await screen.findByText("Update it in Settings")).toBeInTheDocument();
    expect(screen.queryByText("Request failed")).not.toBeInTheDocument();
  });

  it("reports a failed add after the user left the page", async () => {
    server.use(
      http.post(apiPath("/api/v1/products"), async () => {
        await delay(100);
        return HttpResponse.json({ detail: "Database unavailable" }, { status: 503 });
      }),
      http.get(apiPath("/api/v1/domain-rules"), () => HttpResponse.json(page([]))),
    );
    const { user } = renderApp({ route: "/products/new" });

    await user.type(screen.getByLabelText(/Product URL/), "https://shop.example/p/1");
    await user.click(screen.getByRole("button", { name: "Add and check price" }));
    await user.click(screen.getByRole("link", { name: "Shops" }));

    expect(await screen.findByText("Request failed")).toBeInTheDocument();
  });

  it("stays where the user went when the add finishes later", async () => {
    let created = false;
    server.use(
      http.post(apiPath("/api/v1/products"), async () => {
        await delay(100);
        created = true;
        return HttpResponse.json(makeProduct({ id: 42 }), { status: 201 });
      }),
      http.get(apiPath("/api/v1/domain-rules"), () => HttpResponse.json(page([]))),
    );
    const { user, router } = renderApp({ route: "/products/new" });

    await user.type(screen.getByLabelText(/Product URL/), "https://shop.example/p/1");
    await user.click(screen.getByRole("button", { name: "Add and check price" }));
    await user.click(screen.getByRole("link", { name: "Shops" }));
    await expect.poll(() => created).toBe(true);
    await delay(50);

    expect(router.state.location.pathname).toBe("/domain-rules");
  });

  it("stays quiet about an add cancelled by switching servers", async () => {
    let answered = false;
    server.use(
      http.post(apiPath("/api/v1/products"), async () => {
        await delay(200);
        answered = true;
        return HttpResponse.json(makeProduct({ id: 42 }), { status: 201 });
      }),
      http.get("http://other.test/api/v1/products", () => HttpResponse.json(page([]))),
    );
    const { user } = renderApp({ route: "/products/new" });

    await user.type(screen.getByLabelText(/Product URL/), "https://shop.example/p/1");
    await user.click(screen.getByRole("button", { name: "Add and check price" }));
    await user.click(screen.getByRole("link", { name: "Settings" }));
    const apiUrl = screen.getByLabelText("API URL");
    await user.clear(apiUrl);
    await user.type(apiUrl, "http://other.test");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await expect.poll(() => answered).toBe(true);
    await delay(50);

    expect(screen.queryByText("Request failed")).not.toBeInTheDocument();
  });
});

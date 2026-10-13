import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { page } from "../../../test/factories";
import { renderApp } from "../../../test/render";
import { apiPath, server } from "../../../test/server";
import { loadSettings } from "../storage";

describe("SettingsPage", () => {
  it("is shown on first launch instead of the products list", async () => {
    renderApp({ route: "/", settings: null });

    expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
  });

  it("reports a working connection", async () => {
    server.use(
      http.get("http://localhost:8000/api/v1/products", () => HttpResponse.json(page([]))),
    );
    const { user } = renderApp({ route: "/settings", settings: null });

    await user.type(screen.getByLabelText("API URL"), "http://localhost:8000/");
    await user.type(screen.getByLabelText("API key"), "secret");
    await user.click(screen.getByRole("button", { name: "Test connection" }));

    expect(await screen.findByText("Connection works")).toBeInTheDocument();
  });

  it("reports an invalid API key", async () => {
    server.use(
      http.get(apiPath("/api/v1/products"), () =>
        HttpResponse.json({ detail: "Invalid or missing API key" }, { status: 401 }),
      ),
    );
    const { user } = renderApp({ route: "/settings" });

    await user.click(screen.getByRole("button", { name: "Test connection" }));

    expect(await screen.findByText("Invalid API key")).toBeInTheDocument();
  });

  it("validates the URL without calling the API", async () => {
    const { user } = renderApp({ route: "/settings", settings: null });

    await user.type(screen.getByLabelText("API URL"), "localhost");
    await user.type(screen.getByLabelText("API key"), "secret");
    await user.click(screen.getByRole("button", { name: "Test connection" }));

    expect(
      await screen.findByText("Enter an http(s) URL, e.g. http://localhost:8000"),
    ).toBeInTheDocument();
  });

  it("saves normalized settings and opens the products list", async () => {
    const { user, router } = renderApp({ route: "/settings", settings: null });

    await user.type(screen.getByLabelText("API URL"), " http://localhost:8000/ ");
    await user.type(screen.getByLabelText("API key"), "secret");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(loadSettings()).toEqual({ apiUrl: "http://localhost:8000", apiKey: "secret" });
    expect(router.state.location.pathname).toBe("/");
  });
});

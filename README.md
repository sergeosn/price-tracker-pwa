# Price Tracker PWA

A mobile-first Progressive Web App for [price-change-detector](https://github.com/sergeosn/price-change-detector):
add products by URL, watch their price history and manage shop rules. A learning project built with
React and TypeScript.

## Features

- Products list with filters (all / errors / paused) and "Load more" pagination.
- Add a product by URL with an optional target price and CSS price selector; the price is checked
  immediately.
- Product details: current and target price, last check status, price history chart and list,
  "Check now", edit, delete.
- Shops: domain rules with currency and price selector.
- Installable PWA (app shell cached; data is always loaded from the API).

## Requirements

- Node.js 24+
- A running [price-change-detector](https://github.com/sergeosn/price-change-detector) backend with
  CORS enabled for this app's origin, for example in the backend `.env`:

  ```
  CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
  ```

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. On first launch the app asks for the **API URL** (for example
`http://localhost:8000`) and the backend **API key** (`API_KEY` in the backend `.env`). Use
**Test connection**, then **Save**.

Optionally set a default API URL in `.env.local`:

```
VITE_API_URL=http://localhost:8000
```

## Scripts

| Script                 | What it does                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`          | Dev server on port 5173                                                                                            |
| `npm run build`        | Type check and production build (with service worker and icons)                                                    |
| `npm run preview`      | Serve the production build on port 4173                                                                            |
| `npm test`             | Run all tests once                                                                                                 |
| `npm run test:watch`   | Tests in watch mode                                                                                                |
| `npm run coverage`     | Tests with a coverage report                                                                                       |
| `npm run check`        | Type check, lint, format check and tests (what CI runs)                                                            |
| `npm run gen:api`      | Regenerate `src/api/schema.d.ts` from `src/api/openapi.json`                                                       |
| `npm run gen:api:pull` | Download `openapi.json` from a running backend (`API_URL`, default `http://localhost:8000`), then regenerate types |

## API types

`src/api/openapi.json` is a committed snapshot of the backend schema and `src/api/schema.d.ts` is
generated from it. After a backend API change, run `npm run gen:api:pull`: the type checker then
points at every place in the app (and in the test mocks) that must change.

## Project layout

```
src/
  app/        providers, layout, routes, query client
  api/        generated types, typed client, error mapping
  features/   products, domain-rules, settings (queries, schemas, components, pages)
  shared/     money/date formatting, validation, notifications, shared components
  test/       MSW server, renderApp helper, data factories
```

## Manual smoke test

With the backend running (CORS enabled) and `npm run build && npm run preview`:

1. First launch opens Settings; "Test connection" with a wrong key shows "Invalid API key".
2. Save correct settings; the Products tab opens.
3. Add a product by URL; its page opens with the price or the check error.
4. "Check now" shows "Price changed", "No change" or "Couldn't get the price".
5. Edit the target price; the card shows "Target reached" when the price is at or below it.
6. Add a shop rule with a currency; product prices for that shop show the currency.
7. Delete the product; it disappears from the list.
8. In the browser menu, install the app; it opens in its own window.
9. In DevTools device mode (iPhone, 375 px wide) nothing overflows horizontally.

## Limitations

- The API key is stored in the browser's `localStorage`; there is no real authentication.
- Installing on a phone requires HTTPS for both the app and the backend (browsers block plain-HTTP
  API calls from an HTTPS page). Deployment is not part of this project yet.
- No offline data: the service worker caches only the app shell.

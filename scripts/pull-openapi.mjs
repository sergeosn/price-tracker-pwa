// Downloads the backend OpenAPI schema into src/api/openapi.json.
// Usage: API_URL=http://localhost:8000 npm run gen:api:pull
import { writeFile } from "node:fs/promises";

const apiUrl = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const response = await fetch(`${apiUrl}/api/openapi.json`);
if (!response.ok) {
  console.error(`Failed to fetch ${apiUrl}/api/openapi.json: ${response.status}`);
  process.exit(1);
}
const schema = await response.json();
await writeFile(
  new URL("../src/api/openapi.json", import.meta.url),
  JSON.stringify(schema, null, 2) + "\n",
);
console.log(`Saved OpenAPI schema from ${apiUrl}`);

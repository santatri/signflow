import { defineConfig } from "drizzle-kit";

// Les migrations sont générées en SQL pur, puis appliquées par Wrangler (D1).
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle/migrations",
});

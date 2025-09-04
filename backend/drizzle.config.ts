import type { Config } from "npm:drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: Deno.env.get("DB_HOST")!,
    port: Number(Deno.env.get("DB_PORT")!),
    user: Deno.env.get("DB_USER")!,
    password: Deno.env.get("DB_PASSWORD")!,
    database: Deno.env.get("DB_NAME")!,
  // ensure the node-postgres client does not attempt SSL for local/non-SSL servers
  ssl: false,
  },
} satisfies Config;

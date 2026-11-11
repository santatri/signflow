import { drizzle } from "drizzle-orm/d1";
import { getD1 } from "@/lib/cloudflare/bindings";
import { AppError } from "@/lib/utils/errors";
import * as schema from "./schema";

export function getDb() {
  const d1 = getD1();
  if (!d1) throw new AppError("SERVICE_UNAVAILABLE", "La base de données n'est pas configurée.");
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof getDb>;

import type { ZodType } from "zod";
import { AppError } from "@/lib/utils/errors";

/**
 * Protection CSRF des requêtes qui modifient l'état : les cookies sont SameSite=Lax,
 * et on refuse en plus toute requête dont l'origine n'est pas le site lui-même.
 */
export function assertSameOrigin(request: Request): void {
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new AppError("FORBIDDEN", "Origine de la requête refusée.");
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    throw new AppError("FORBIDDEN", "Origine de la requête refusée.");
  }
}

const DEFAULT_MAX_BODY_BYTES = 16 * 1024;

export async function parseJsonBody<T>(request: Request, schema: ZodType<T>, maxBytes = DEFAULT_MAX_BODY_BYTES): Promise<T> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new AppError("BAD_REQUEST", "Requête trop volumineuse.");
  const text = await request.text();
  if (text.length > maxBytes) throw new AppError("BAD_REQUEST", "Requête trop volumineuse.");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new AppError("BAD_REQUEST", "Corps de requête JSON invalide.");
  }
  const result = schema.safeParse(raw);
  if (!result.success) throw new AppError("VALIDATION_ERROR", result.error.issues[0]?.message ?? "Données invalides.");
  return result.data;
}

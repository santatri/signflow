import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/lib/db/client";
import { AppError } from "@/lib/utils/errors";
import { getSessionUser, SESSION_COOKIE, type SessionUser } from "./session";

/** Utilisateur de la requête courante, ou null (non connecté, session expirée, base indisponible). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await getSessionUser(getDb(), token);
  } catch {
    return null;
  }
});

/** Pour les pages : redirige vers la connexion. À appeler dans chaque page ou accès aux données, pas seulement dans un layout. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdminPage(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

/** Pour les Route Handlers : lève 401 / 403. */
export async function requireApiUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("UNAUTHORIZED", "Authentification requise.");
  return user;
}

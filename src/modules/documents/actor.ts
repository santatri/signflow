import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { guestSessions } from "@/lib/db/schema";
import { getCurrentUser } from "@/modules/auth/current-user";
import { randomToken, sha256Hex } from "@/modules/auth/crypto";

/** Qui possède les documents : un compte, ou une session invité (visiteur sans compte). */
export type Actor = { kind: "user"; id: string } | { kind: "guest"; id: string };

export const GUEST_COOKIE = "sf_guest";
export const GUEST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface NewGuestSession { token: string; expiresAt: Date }

export function guestCookieOptions(expiresAt: Date) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", expires: expiresAt };
}

/** Retrouve l'acteur courant sans rien créer. */
export async function resolveActor(): Promise<Actor | null> {
  const user = await getCurrentUser();
  if (user) return { kind: "user", id: user.id };
  const token = (await cookies()).get(GUEST_COOKIE)?.value;
  if (!token) return null;
  try {
    const rows = await getDb()
      .select({ id: guestSessions.id })
      .from(guestSessions)
      .where(and(eq(guestSessions.tokenHash, await sha256Hex(token)), gt(guestSessions.expiresAt, new Date())))
      .limit(1);
    return rows[0] ? { kind: "guest", id: rows[0].id } : null;
  } catch {
    return null;
  }
}

/** Pour l'import : crée une session invité si le visiteur n'a ni compte ni session. Le cookie est à poser sur la réponse. */
export async function resolveOrCreateActor(): Promise<{ actor: Actor; newGuest?: NewGuestSession }> {
  const existing = await resolveActor();
  if (existing) return { actor: existing };
  const token = randomToken();
  const expiresAt = new Date(Date.now() + GUEST_TTL_MS);
  const id = crypto.randomUUID();
  await getDb().insert(guestSessions).values({ id, tokenHash: await sha256Hex(token), expiresAt });
  return { actor: { kind: "guest", id }, newGuest: { token, expiresAt } };
}

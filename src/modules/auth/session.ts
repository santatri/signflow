import { and, eq, gt } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import { randomToken, sha256Hex } from "./crypto";

export const SESSION_COOKIE = "sf_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  emailVerifiedAt: Date | null;
}

/** Crée une session. Seul le hash SHA-256 du jeton est stocké : une fuite de la base ne donne pas de session valide. */
export async function createSession(db: Database, userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id: crypto.randomUUID(), userId, tokenHash: await sha256Hex(token), expiresAt });
  return { token, expiresAt };
}

export async function getSessionUser(db: Database, token: string): Promise<SessionUser | null> {
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, emailVerifiedAt: users.emailVerifiedAt })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, await sha256Hex(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function deleteSession(db: Database, token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, await sha256Hex(token)));
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

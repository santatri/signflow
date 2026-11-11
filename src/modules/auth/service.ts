import { eq } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { auditLogs, users } from "@/lib/db/schema";
import { AppError } from "@/lib/utils/errors";
import { hashPassword, verifyPassword } from "./password";
import { createSession, type SessionUser } from "./session";

type Credentials = { email: string; password: string };

let dummyHash: Promise<string> | null = null;

async function audit(db: Database, actorId: string, action: string) {
  await db.insert(auditLogs).values({ id: crypto.randomUUID(), actorId, action });
}

export async function registerUser(db: Database, input: Credentials & { name: string }) {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
  if (existing.length > 0) throw new AppError("CONFLICT", "Un compte existe déjà avec cette adresse email.");

  const id = crypto.randomUUID();
  try {
    await db.insert(users).values({ id, name: input.name, email: input.email, passwordHash: await hashPassword(input.password) });
  } catch {
    // Course entre deux inscriptions simultanées : l'index unique sur l'email fait foi.
    throw new AppError("CONFLICT", "Un compte existe déjà avec cette adresse email.");
  }
  await audit(db, id, "auth.register");
  const session = await createSession(db, id);
  const user: SessionUser = { id, name: input.name, email: input.email, role: "user", emailVerifiedAt: null };
  return { user, session };
}

export async function loginUser(db: Database, input: Credentials) {
  const rows = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  const found = rows[0];
  // Vérifie toujours un hash (factice si l'utilisateur n'existe pas) pour ne pas révéler l'existence d'un compte par le temps de réponse.
  dummyHash ??= hashPassword("signflow-dummy-password");
  const ok = await verifyPassword(input.password, found?.passwordHash ?? (await dummyHash));
  if (!found || !ok) throw new AppError("UNAUTHORIZED", "Adresse email ou mot de passe incorrect.");

  await audit(db, found.id, "auth.login");
  const session = await createSession(db, found.id);
  const user: SessionUser = { id: found.id, name: found.name, email: found.email, role: found.role, emailVerifiedAt: found.emailVerifiedAt };
  return { user, session };
}

import { AppError } from "@/lib/utils/errors";
import { requireApiUser } from "./current-user";

/** Garde d'accès administrateur pour les Route Handlers : 401 si non connecté, 403 si le rôle n'est pas « admin ». */
export async function requireAdmin() {
  const user = await requireApiUser();
  if (user.role !== "admin") throw new AppError("FORBIDDEN", "Accès réservé aux administrateurs.");
  return user;
}

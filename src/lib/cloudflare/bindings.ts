import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Couche d'accès centralisée aux ressources Cloudflare.
 * Aucun composant React ne doit importer ce module : uniquement les Route Handlers,
 * Server Components et modules serveur.
 *
 * Les getters retournent `null` quand un binding n'est pas configuré
 * (ex. développement sans compte Cloudflare).
 */
export function getEnv(): CloudflareEnv | null {
  try {
    return getCloudflareContext().env;
  } catch {
    return null;
  }
}

export function getD1(): D1Database | null {
  return getEnv()?.DB ?? null;
}

export function getR2(): R2Bucket | null {
  return getEnv()?.FILES ?? null;
}

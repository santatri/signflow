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

export function getB2Config() {
  const env = getEnv();
  const endpoint = env?.B2_ENDPOINT || process.env.B2_ENDPOINT;
  const region = env?.B2_REGION || process.env.B2_REGION;
  const bucket = env?.B2_BUCKET || process.env.B2_BUCKET;
  const keyId = env?.B2_KEY_ID || process.env.B2_KEY_ID;
  const applicationKey = env?.B2_APPLICATION_KEY || process.env.B2_APPLICATION_KEY;

  if (!endpoint || !region || !bucket || !keyId || !applicationKey) return null;
  return { endpoint, region, bucket, keyId, applicationKey };
}

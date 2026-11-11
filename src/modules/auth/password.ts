import { fromBase64Url, timingSafeEqual, toBase64Url } from "./crypto";

/**
 * PBKDF2-SHA256 via Web Crypto. Cloudflare Workers plafonne PBKDF2 à 100 000 itérations :
 * c'est la valeur maximale utilisable, elle est donc stockée dans le hash pour permettre
 * une migration ultérieure vers un autre algorithme.
 * Format : pbkdf2-sha256$<itérations>$<sel base64url>$<hash base64url>
 */
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    HASH_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2-sha256$${ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, iter, salt, hash] = stored.split("$");
  const iterations = Number(iter);
  if (algo !== "pbkdf2-sha256" || !salt || !hash || !Number.isInteger(iterations) || iterations < 1 || iterations > ITERATIONS) {
    return false;
  }
  const candidate = await derive(password, fromBase64Url(salt), iterations);
  return timingSafeEqual(candidate, fromBase64Url(hash));
}

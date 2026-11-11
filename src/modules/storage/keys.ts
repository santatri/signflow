import { sanitizeFileName } from "@/lib/utils/format";

export const STORAGE_PREFIXES = {
  originals: "documents/originals/",
  versions: "documents/versions/",
  signed: "documents/signed/",
  signatures: "signatures/",
  temporary: "temporary/",
  exports: "exports/",
} as const;

export type StorageArea = keyof typeof STORAGE_PREFIXES;

/** Clé R2 : <zone>/<propriétaire>/<id>/<nom nettoyé>. Le propriétaire isole les fichiers entre comptes/sessions invité. */
export function buildStorageKey(area: StorageArea, ownerScope: string, objectId: string, fileName: string): string {
  const scope = ownerScope.replace(/[^a-zA-Z0-9_-]/g, "");
  const id = objectId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!scope || !id) throw new Error("Clé de stockage invalide.");
  return `${STORAGE_PREFIXES[area]}${scope}/${id}/${sanitizeFileName(fileName)}`;
}

export function isValidStorageKey(key: string): boolean {
  if (key.includes("..") || key.startsWith("/") || key.includes("//")) return false;
  return Object.values(STORAGE_PREFIXES).some((p) => key.startsWith(p));
}

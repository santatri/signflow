import { getR2 } from "@/lib/cloudflare/bindings";
import { AppError } from "@/lib/utils/errors";
import { isValidStorageKey } from "./keys";

export interface FileMetadata {
  key: string;
  size: number;
  contentType: string | null;
  uploadedAt: Date;
}

function bucket(): R2Bucket {
  const r2 = getR2();
  if (!r2) throw new AppError("SERVICE_UNAVAILABLE", "Le stockage de fichiers n'est pas configuré.");
  return r2;
}

function assertKey(key: string) {
  if (!isValidStorageKey(key)) throw new AppError("BAD_REQUEST", "Clé de stockage invalide.");
}

/** Stockage privé : aucun lien public, tout accès passe par le serveur. */
export async function uploadFile(
  key: string,
  body: ArrayBuffer | ReadableStream | Uint8Array,
  contentType: string,
): Promise<void> {
  assertKey(key);
  await bucket().put(key, body, { httpMetadata: { contentType } });
}

export async function getFile(key: string): Promise<R2ObjectBody | null> {
  assertKey(key);
  return bucket().get(key);
}

export async function deleteFile(key: string): Promise<void> {
  assertKey(key);
  await bucket().delete(key);
}

export async function fileExists(key: string): Promise<boolean> {
  return (await getFileMetadata(key)) !== null;
}

export async function getFileMetadata(key: string): Promise<FileMetadata | null> {
  assertKey(key);
  const head = await bucket().head(key);
  if (!head) return null;
  return {
    key: head.key,
    size: head.size,
    contentType: head.httpMetadata?.contentType ?? null,
    uploadedAt: head.uploaded,
  };
}

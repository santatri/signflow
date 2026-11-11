import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getB2Config, getR2 } from "@/lib/cloudflare/bindings";
import { AppError } from "@/lib/utils/errors";
import { isValidStorageKey } from "./keys";

export interface FileMetadata {
  key: string;
  size: number;
  contentType: string | null;
  uploadedAt: Date;
}

export interface StoredFile {
  body: ReadableStream<Uint8Array>;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

let cachedClient: S3Client | null = null;
let cachedConfigKey: string | null = null;

function b2() {
  const config = getB2Config();
  if (!config) return null;
  const configKey = JSON.stringify(config);
  if (!cachedClient || cachedConfigKey !== configKey) {
    cachedClient?.destroy();
    cachedClient = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.keyId,
        secretAccessKey: config.applicationKey,
      },
    });
    cachedConfigKey = configKey;
  }
  return { client: cachedClient, bucket: config.bucket };
}

function bucket(): R2Bucket | null {
  if (b2()) return null;
  const r2 = getR2();
  if (r2) return r2;
  throw new AppError("SERVICE_UNAVAILABLE", "Le stockage de fichiers n'est pas configuré.");
}

function assertKey(key: string) {
  if (!isValidStorageKey(key)) throw new AppError("BAD_REQUEST", "Clé de stockage invalide.");
}

/** Stockage privé : aucun lien public, tout accès passe par le serveur. */
export async function uploadFile(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  assertKey(key);
  const storage = b2();
  if (storage) {
    await storage.client.send(new PutObjectCommand({
      Bucket: storage.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }));
    return;
  }
  await bucket()?.put(key, body, { httpMetadata: { contentType } });
}

export async function getFile(key: string): Promise<StoredFile | null> {
  assertKey(key);
  const storage = b2();
  if (storage) {
    try {
      const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: key }));
      if (!object.Body) return null;
      const body = object.Body.transformToWebStream();
      return {
        body,
        size: object.ContentLength ?? 0,
        arrayBuffer: () => new Response(body).arrayBuffer(),
      };
    } catch (error) {
      if (error instanceof Error && error.name === "NoSuchKey") return null;
      throw error;
    }
  }
  return bucket()?.get(key) ?? null;
}

export async function deleteFile(key: string): Promise<void> {
  assertKey(key);
  const storage = b2();
  if (storage) {
    await storage.client.send(new DeleteObjectCommand({ Bucket: storage.bucket, Key: key }));
    return;
  }
  await bucket()?.delete(key);
}

export async function fileExists(key: string): Promise<boolean> {
  return (await getFileMetadata(key)) !== null;
}

export async function getFileMetadata(key: string): Promise<FileMetadata | null> {
  assertKey(key);
  const storage = b2();
  if (storage) {
    try {
      const head = await storage.client.send(new HeadObjectCommand({ Bucket: storage.bucket, Key: key }));
      return {
        key,
        size: head.ContentLength ?? 0,
        contentType: head.ContentType ?? null,
        uploadedAt: head.LastModified ?? new Date(0),
      };
    } catch (error) {
      if (error instanceof Error && (error.name === "NotFound" || error.name === "NoSuchKey")) return null;
      throw error;
    }
  }
  const head = await bucket()?.head(key);
  if (!head) return null;
  return {
    key: head.key,
    size: head.size,
    contentType: head.httpMetadata?.contentType ?? null,
    uploadedAt: head.uploaded,
  };
}

export async function checkStorageConnection(): Promise<void> {
  const storage = b2();
  if (storage) {
    await storage.client.send(new ListObjectsV2Command({ Bucket: storage.bucket, MaxKeys: 1 }));
    return;
  }
  const r2 = bucket();
  await r2?.list({ limit: 1 });
}

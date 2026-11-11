import { and, count, desc, eq, max } from "drizzle-orm";
import { PDFDocument } from "pdf-lib";
import { MAX_DOCUMENT_SIZE_BYTES } from "@/config/statuses";
import type { Database } from "@/lib/db/client";
import { auditLogs, documents, documentVersions } from "@/lib/db/schema";
import { AppError } from "@/lib/utils/errors";
import { hasPdfSignature } from "@/lib/validation/documents";
import { decodeDataUrl, type SignRequestInput } from "@/lib/validation/signing";
import { sha256Hex } from "@/modules/auth/crypto";
import { buildStorageKey } from "@/modules/storage/keys";
import { deleteFile, getFile, uploadFile } from "@/modules/storage/service";
import type { Actor } from "./actor";

export const MAX_PDF_PAGES = 100;
export const MAX_DOCUMENTS_PER_ACTOR = 50;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isDocumentId(value: string): boolean {
  return UUID.test(value);
}

function ownerCondition(actor: Actor) {
  return actor.kind === "user" ? eq(documents.ownerId, actor.id) : eq(documents.guestSessionId, actor.id);
}

const documentColumns = {
  id: documents.id,
  title: documents.title,
  status: documents.status,
  size: documents.size,
  signedKey: documents.signedKey,
  originalKey: documents.originalKey,
  createdAt: documents.createdAt,
  updatedAt: documents.updatedAt,
};

export type DocumentRecord = Awaited<ReturnType<typeof getOwnedDocument>>;

/** Toute lecture passe par cette condition : un document d'un autre propriétaire est indistinguable d'un document inexistant. */
export async function getOwnedDocument(db: Database, actor: Actor, id: string) {
  if (!isDocumentId(id)) throw new AppError("NOT_FOUND", "Document introuvable.");
  const rows = await db.select(documentColumns).from(documents).where(and(eq(documents.id, id), ownerCondition(actor))).limit(1);
  if (!rows[0]) throw new AppError("NOT_FOUND", "Document introuvable.");
  return rows[0];
}

export async function listDocuments(db: Database, actor: Actor, limit = 50) {
  return db.select(documentColumns).from(documents).where(ownerCondition(actor)).orderBy(desc(documents.updatedAt)).limit(limit);
}

export async function countDocumentsByStatus(db: Database, actor: Actor) {
  const rows = await db.select({ status: documents.status, n: count() }).from(documents).where(ownerCondition(actor)).groupBy(documents.status);
  const by = (s: string) => rows.find((r) => r.status === s)?.n ?? 0;
  return { total: rows.reduce((a, r) => a + r.n, 0), signed: by("signed"), awaiting: by("uploaded") + by("pending") };
}

function titleFromFileName(name: string): string {
  const base = (name.split(/[\\/]/).pop() ?? "").replace(/\.pdf$/i, "").trim();
  return (base || "Document").slice(0, 200);
}

export async function createDocument(db: Database, actor: Actor, file: File) {
  if (file.size <= 0) throw new AppError("VALIDATION_ERROR", "Le fichier est vide.");
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) throw new AppError("VALIDATION_ERROR", "Le fichier dépasse la taille maximale de 10 Mo.");

  const owned = await db.select({ n: count() }).from(documents).where(ownerCondition(actor));
  if ((owned[0]?.n ?? 0) >= MAX_DOCUMENTS_PER_ACTOR) {
    throw new AppError("RATE_LIMITED", `Limite de ${MAX_DOCUMENTS_PER_ACTOR} documents atteinte.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasPdfSignature(bytes)) throw new AppError("VALIDATION_ERROR", "Ce fichier n'est pas un PDF valide.");
  try {
    const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
    if (pdf.getPageCount() > MAX_PDF_PAGES) throw new AppError("VALIDATION_ERROR", `Le document dépasse ${MAX_PDF_PAGES} pages.`);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("VALIDATION_ERROR", "PDF illisible, corrompu ou protégé par mot de passe.");
  }

  const id = crypto.randomUUID();
  const key = buildStorageKey("originals", actor.id, id, "original.pdf");
  const hash = await sha256Hex(bytes);
  await uploadFile(key, bytes, "application/pdf");
  try {
    await db.batch([
      db.insert(documents).values({
        id,
        ownerId: actor.kind === "user" ? actor.id : null,
        guestSessionId: actor.kind === "guest" ? actor.id : null,
        title: titleFromFileName(file.name),
        originalKey: key,
        mimeType: "application/pdf",
        size: bytes.length,
        status: "uploaded",
      }),
      db.insert(documentVersions).values({ id: crypto.randomUUID(), documentId: id, fileKey: key, sha256: hash, versionNumber: 1 }),
      db.insert(auditLogs).values({ id: crypto.randomUUID(), actorId: actor.id, documentId: id, action: "document.upload" }),
    ]);
  } catch {
    await deleteFile(key).catch(() => undefined);
    throw new AppError("INTERNAL_ERROR", "Impossible d'enregistrer le document.");
  }
  return getOwnedDocument(db, actor, id);
}

/** Fichier à servir : la dernière version (signée si elle existe) ou l'originale. */
export function pickFileKey(doc: { originalKey: string; signedKey: string | null }, kind: "original" | "signed" | "latest") {
  if (kind === "original") return doc.originalKey;
  if (kind === "signed") {
    if (!doc.signedKey) throw new AppError("NOT_FOUND", "Ce document n'est pas encore signé.");
    return doc.signedKey;
  }
  return doc.signedKey ?? doc.originalKey;
}

export async function signDocument(db: Database, actor: Actor, id: string, input: SignRequestInput) {
  const doc = await getOwnedDocument(db, actor, id);
  const source = await getFile(pickFileKey(doc, "latest"));
  if (!source) throw new AppError("NOT_FOUND", "Fichier du document introuvable.");

  let signature;
  try {
    signature = decodeDataUrl(input.signatureImage);
  } catch {
    throw new AppError("VALIDATION_ERROR", "Image de signature invalide.");
  }

  const pdf = await PDFDocument.load(new Uint8Array(await source.arrayBuffer()), { updateMetadata: false });
  let image;
  try {
    image = signature.format === "png" ? await pdf.embedPng(signature.bytes) : await pdf.embedJpg(signature.bytes);
  } catch {
    throw new AppError("VALIDATION_ERROR", "Image de signature illisible.");
  }

  const pages = pdf.getPages();
  for (const p of input.placements) {
    const page = pages[p.page - 1];
    if (!page) throw new AppError("VALIDATION_ERROR", `La page ${p.page} n'existe pas.`);
    if (page.getRotation().angle % 360 !== 0) {
      throw new AppError("VALIDATION_ERROR", `La page ${p.page} est pivotée : les pages pivotées ne sont pas encore prises en charge.`);
    }
    // Zone visible (CropBox, sinon MediaBox) : c'est celle que le navigateur affiche. Les coordonnées PDF partent du bas.
    const box = page.getCropBox();
    page.drawImage(image, {
      x: box.x + p.x * box.width,
      y: box.y + box.height - (p.y + p.height) * box.height,
      width: p.width * box.width,
      height: p.height * box.height,
    });
  }

  const output = await pdf.save();
  const hash = await sha256Hex(output);
  const latest = await db.select({ n: max(documentVersions.versionNumber) }).from(documentVersions).where(eq(documentVersions.documentId, id));
  const version = (latest[0]?.n ?? 1) + 1;
  const key = buildStorageKey("signed", actor.id, id, `signed-v${version}.pdf`);

  await uploadFile(key, output, "application/pdf");
  try {
    await db.batch([
      db.insert(documentVersions).values({ id: crypto.randomUUID(), documentId: id, fileKey: key, sha256: hash, versionNumber: version }),
      db.update(documents).set({ signedKey: key, status: "signed", updatedAt: new Date() }).where(eq(documents.id, id)),
      db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        actorId: actor.id,
        documentId: id,
        action: "document.sign",
        metadata: JSON.stringify({ version, placements: input.placements.length, signatureType: input.signatureType }),
      }),
    ]);
  } catch {
    await deleteFile(key).catch(() => undefined);
    throw new AppError("INTERNAL_ERROR", "Impossible d'enregistrer le document signé.");
  }
  return { version, sha256: hash };
}

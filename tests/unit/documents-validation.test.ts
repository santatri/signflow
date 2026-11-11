import { describe, expect, it } from "vitest";
import { MAX_DOCUMENT_SIZE_BYTES } from "@/config/statuses";
import { documentUploadMetaSchema, hasPdfSignature } from "@/lib/validation/documents";

describe("documentUploadMetaSchema", () => {
  it("accepte un PDF de taille valide", () => {
    expect(documentUploadMetaSchema.safeParse({ name: "contrat.pdf", mimeType: "application/pdf", size: 1024 }).success).toBe(true);
  });
  it("refuse un autre type MIME", () => {
    expect(documentUploadMetaSchema.safeParse({ name: "a.png", mimeType: "image/png", size: 10 }).success).toBe(false);
  });
  it("refuse un fichier vide ou trop gros", () => {
    expect(documentUploadMetaSchema.safeParse({ name: "a.pdf", mimeType: "application/pdf", size: 0 }).success).toBe(false);
    expect(documentUploadMetaSchema.safeParse({ name: "a.pdf", mimeType: "application/pdf", size: MAX_DOCUMENT_SIZE_BYTES + 1 }).success).toBe(false);
  });
});

describe("hasPdfSignature", () => {
  it("reconnaît %PDF-", () => {
    expect(hasPdfSignature(new TextEncoder().encode("%PDF-1.7\n..."))).toBe(true);
  });
  it("rejette un contenu non PDF", () => {
    expect(hasPdfSignature(new TextEncoder().encode("<html>"))).toBe(false);
    expect(hasPdfSignature(new Uint8Array([]))).toBe(false);
  });
});

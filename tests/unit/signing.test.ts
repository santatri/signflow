import { describe, expect, it } from "vitest";
import { decodeDataUrl, placementSchema, signRequestSchema } from "@/lib/validation/signing";
import { buildStorageKey, isValidStorageKey } from "@/modules/storage/keys";
import { isDocumentId } from "@/modules/documents/service";

// PNG 1x1 valide
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const ok = { page: 1, x: 0.1, y: 0.1, width: 0.3, height: 0.05 };

describe("placementSchema", () => {
  it("accepte un emplacement dans la page", () => expect(placementSchema.safeParse(ok).success).toBe(true));
  it("refuse un dépassement horizontal ou vertical", () => {
    expect(placementSchema.safeParse({ ...ok, x: 0.9 }).success).toBe(false);
    expect(placementSchema.safeParse({ ...ok, y: 0.98 }).success).toBe(false);
  });
  it("refuse page 0, valeurs négatives, NaN et tailles nulles", () => {
    expect(placementSchema.safeParse({ ...ok, page: 0 }).success).toBe(false);
    expect(placementSchema.safeParse({ ...ok, x: -0.1 }).success).toBe(false);
    expect(placementSchema.safeParse({ ...ok, x: Number.NaN }).success).toBe(false);
    expect(placementSchema.safeParse({ ...ok, width: 0 }).success).toBe(false);
  });
});

describe("signRequestSchema", () => {
  const base = { signatureType: "drawn", signatureImage: PNG, placements: [ok] };
  it("accepte une requête valide", () => expect(signRequestSchema.safeParse(base).success).toBe(true));
  it("exige au moins un emplacement et en limite le nombre", () => {
    expect(signRequestSchema.safeParse({ ...base, placements: [] }).success).toBe(false);
    expect(signRequestSchema.safeParse({ ...base, placements: Array(21).fill(ok) }).success).toBe(false);
  });
  it("refuse une image qui n'est pas un data URL PNG/JPEG", () => {
    expect(signRequestSchema.safeParse({ ...base, signatureImage: "data:image/svg+xml;base64,AAAA" }).success).toBe(false);
    expect(signRequestSchema.safeParse({ ...base, signatureImage: "https://evil.test/x.png" }).success).toBe(false);
  });
  it("refuse un type de signature inconnu", () => {
    expect(signRequestSchema.safeParse({ ...base, signatureType: "stamp" }).success).toBe(false);
  });
});

describe("decodeDataUrl", () => {
  it("décode un PNG réel", () => expect(decodeDataUrl(PNG).format).toBe("png"));
  it("refuse un contenu dont les octets ne correspondent pas au format annoncé", () => {
    expect(() => decodeDataUrl("data:image/png;base64,AAAAAAAA")).toThrow();
    expect(() => decodeDataUrl(PNG.replace("image/png", "image/jpeg"))).toThrow();
  });
});

describe("identifiants et clés de stockage", () => {
  it("reconnaît un UUID et rejette le reste", () => {
    expect(isDocumentId(crypto.randomUUID())).toBe(true);
    expect(isDocumentId("../etc/passwd")).toBe(false);
    expect(isDocumentId("new")).toBe(false);
  });
  it("isole les fichiers par propriétaire et refuse la traversée de chemin", () => {
    const key = buildStorageKey("originals", "user-1", "doc-1", "../../mon fichier.pdf");
    expect(key.startsWith("documents/originals/user-1/doc-1/")).toBe(true);
    expect(key).not.toContain("..");
    expect(isValidStorageKey("documents/originals/../x")).toBe(false);
  });
});

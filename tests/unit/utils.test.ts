import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";
import { formatBytes, sanitizeFileName } from "@/lib/utils/format";

describe("formatBytes", () => {
  it("formate les tailles", () => {
    expect(formatBytes(0)).toBe("0 o");
    expect(formatBytes(1536)).toBe("1,5 Ko");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5,0 Mo");
  });
  it("gère les valeurs invalides", () => {
    expect(formatBytes(-1)).toBe("—");
    expect(formatBytes(Number.NaN)).toBe("—");
  });
});

describe("sanitizeFileName", () => {
  it("supprime les chemins, accents et caractères dangereux", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFileName("Contrat été 2026.pdf")).toBe("Contrat-ete-2026.pdf");
    expect(sanitizeFileName("   ")).toBe("document");
  });
});

describe("cn", () => {
  it("fusionne les classes Tailwind conflictuelles", () => {
    expect(cn("px-2", "px-4", false && "hidden")).toBe("px-4");
  });
});

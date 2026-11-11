import { describe, expect, it } from "vitest";
import { buildStorageKey, isValidStorageKey } from "@/modules/storage/keys";

describe("clés de stockage", () => {
  it("construit une clé isolée par propriétaire", () => {
    expect(buildStorageKey("originals", "user_1", "doc_9", "Mon Contrat.pdf")).toBe("documents/originals/user_1/doc_9/Mon-Contrat.pdf");
  });
  it("refuse un identifiant vide ou purement invalide", () => {
    expect(() => buildStorageKey("originals", "../", "doc", "a.pdf")).toThrow();
  });
  it("valide uniquement les préfixes connus, sans traversée de chemin", () => {
    expect(isValidStorageKey("documents/signed/u/d/a.pdf")).toBe(true);
    expect(isValidStorageKey("../secret")).toBe(false);
    expect(isValidStorageKey("documents/originals/../../x")).toBe(false);
    expect(isValidStorageKey("autre/chose.pdf")).toBe(false);
  });
});

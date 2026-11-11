import { describe, expect, it } from "vitest";
import { DOCUMENT_STATUSES, DOCUMENT_STATUS_LABELS, getDocumentStatusLabel, isDocumentStatus, REQUEST_STATUSES, REQUEST_STATUS_LABELS } from "@/config/statuses";

describe("statuts", () => {
  it("fournit un libellé pour chaque statut", () => {
    for (const s of DOCUMENT_STATUSES) expect(DOCUMENT_STATUS_LABELS[s]).toBeTruthy();
    for (const s of REQUEST_STATUSES) expect(REQUEST_STATUS_LABELS[s]).toBeTruthy();
  });
  it("reconnaît les statuts valides", () => {
    expect(isDocumentStatus("signed")).toBe(true);
    expect(isDocumentStatus("hacked")).toBe(false);
    expect(getDocumentStatusLabel("hacked")).toBe("Inconnu");
  });
});

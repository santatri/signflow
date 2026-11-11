export const DOCUMENT_STATUSES = ["uploaded", "pending", "signed", "archived"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  uploaded: "Importé",
  pending: "En attente",
  signed: "Signé",
  archived: "Archivé",
};

export const REQUEST_STATUSES = ["draft", "sent", "completed", "cancelled", "expired"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  completed: "Terminée",
  cancelled: "Annulée",
  expired: "Expirée",
};

export function isDocumentStatus(value: unknown): value is DocumentStatus {
  return typeof value === "string" && (DOCUMENT_STATUSES as readonly string[]).includes(value);
}

export function getDocumentStatusLabel(status: string): string {
  return isDocumentStatus(status) ? DOCUMENT_STATUS_LABELS[status] : "Inconnu";
}

export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf"] as const;
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

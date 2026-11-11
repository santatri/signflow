import { z } from "zod";
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from "@/config/statuses";

export const documentUploadMetaSchema = z.object({
  name: z.string().trim().min(1).max(200),
  mimeType: z.enum(ALLOWED_DOCUMENT_MIME_TYPES, { message: "Seuls les fichiers PDF sont acceptés." }),
  size: z
    .number()
    .int()
    .positive("Le fichier est vide.")
    .max(MAX_DOCUMENT_SIZE_BYTES, "Le fichier dépasse la taille maximale de 10 Mo."),
});

/** Vérifie la signature magique d'un PDF ("%PDF-") : le type MIME envoyé par le navigateur n'est pas fiable. */
export function hasPdfSignature(bytes: Uint8Array): boolean {
  const magic = [0x25, 0x50, 0x44, 0x46, 0x2d];
  return magic.every((b, i) => bytes[i] === b);
}

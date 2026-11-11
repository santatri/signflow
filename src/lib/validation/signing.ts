import { z } from "zod";

/** Coordonnées relatives à la page affichée (0 à 1), origine en haut à gauche : indépendantes du zoom et de la taille d'écran. */
export const placementSchema = z
  .object({
    page: z.number().int().min(1).max(500),
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0.02).max(1),
    height: z.number().min(0.01).max(1),
  })
  .refine((p) => p.x + p.width <= 1.0001 && p.y + p.height <= 1.0001, {
    message: "La signature dépasse les limites de la page.",
  });

export const MAX_SIGNATURE_DATA_URL_LENGTH = 1_000_000;

export const signRequestSchema = z.object({
  signatureType: z.enum(["drawn", "typed", "image"]),
  signatureImage: z
    .string()
    .max(MAX_SIGNATURE_DATA_URL_LENGTH, "L'image de signature est trop volumineuse.")
    .regex(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/, "Image de signature invalide (PNG ou JPEG attendu)."),
  placements: z.array(placementSchema).min(1, "Placez la signature sur le document.").max(20, "20 emplacements maximum."),
});

export type Placement = z.infer<typeof placementSchema>;
export type SignRequestInput = z.infer<typeof signRequestSchema>;

export function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; format: "png" | "jpeg" } {
  const comma = dataUrl.indexOf(",");
  const format = dataUrl.startsWith("data:image/png") ? "png" : "jpeg";
  const bin = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if ((format === "png" && !isPng) || (format === "jpeg" && !isJpeg)) throw new Error("format");
  return { bytes, format };
}

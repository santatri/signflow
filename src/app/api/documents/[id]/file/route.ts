import { getDb } from "@/lib/db/client";
import { AppError, toErrorResponse } from "@/lib/utils/errors";
import { sanitizeFileName } from "@/lib/utils/format";
import { resolveActor } from "@/modules/documents/actor";
import { getOwnedDocument, pickFileKey } from "@/modules/documents/service";
import { getFile } from "@/modules/storage/service";

export const dynamic = "force-dynamic";

/** Sert le PDF au propriétaire uniquement. Aucun lien public : le stockage n'est jamais exposé directement. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await resolveActor();
    if (!actor) throw new AppError("NOT_FOUND", "Document introuvable.");
    const doc = await getOwnedDocument(getDb(), actor, id);

    const url = new URL(request.url);
    const kindParam = url.searchParams.get("kind") ?? "latest";
    if (kindParam !== "original" && kindParam !== "signed" && kindParam !== "latest") throw new AppError("BAD_REQUEST", "Paramètre kind invalide.");
    const object = await getFile(pickFileKey(doc, kindParam));
    if (!object) throw new AppError("NOT_FOUND", "Fichier introuvable.");

    const signed = kindParam !== "original" && doc.signedKey !== null;
    const name = `${sanitizeFileName(doc.title)}${signed ? "-signe" : ""}.pdf`;
    const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
    return new Response(object.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(object.size),
        "Content-Disposition": `${disposition}; filename="${name}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

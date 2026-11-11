import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { assertSameOrigin } from "@/lib/security/request";
import { AppError, toErrorResponse } from "@/lib/utils/errors";
import { MAX_DOCUMENT_SIZE_BYTES } from "@/config/statuses";
import { GUEST_COOKIE, guestCookieOptions, resolveActor, resolveOrCreateActor } from "@/modules/documents/actor";
import { createDocument, listDocuments } from "@/modules/documents/service";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const actor = await resolveActor();
    const items = actor ? await listDocuments(getDb(), actor) : [];
    return NextResponse.json(
      { documents: items.map((d) => ({ id: d.id, title: d.title, status: d.status, size: d.size, signed: d.signedKey !== null, updatedAt: d.updatedAt })) },
      { headers: NO_STORE },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    // Rejet précoce avant de lire le corps (marge pour l'enveloppe multipart).
    if (Number(request.headers.get("content-length") ?? 0) > MAX_DOCUMENT_SIZE_BYTES + 64 * 1024) {
      throw new AppError("VALIDATION_ERROR", "Le fichier dépasse la taille maximale de 10 Mo.");
    }
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new AppError("BAD_REQUEST", "Formulaire invalide.");
    }
    const file = form.get("file");
    if (!(file instanceof File)) throw new AppError("VALIDATION_ERROR", "Aucun fichier reçu.");

    const { actor, newGuest } = await resolveOrCreateActor();
    const doc = await createDocument(getDb(), actor, file);
    const response = NextResponse.json({ document: { id: doc.id, title: doc.title, status: doc.status, size: doc.size } }, { status: 201, headers: NO_STORE });
    if (newGuest) response.cookies.set(GUEST_COOKIE, newGuest.token, guestCookieOptions(newGuest.expiresAt));
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { assertSameOrigin, parseJsonBody } from "@/lib/security/request";
import { AppError, toErrorResponse } from "@/lib/utils/errors";
import { signRequestSchema } from "@/lib/validation/signing";
import { resolveActor } from "@/modules/documents/actor";
import { signDocument } from "@/modules/documents/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const { id } = await params;
    const actor = await resolveActor();
    if (!actor) throw new AppError("NOT_FOUND", "Document introuvable.");
    const input = await parseJsonBody(request, signRequestSchema, 1_300_000);
    const result = await signDocument(getDb(), actor, id, input);
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return toErrorResponse(error);
  }
}

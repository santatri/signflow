import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { assertSameOrigin } from "@/lib/security/request";
import { toErrorResponse } from "@/lib/utils/errors";
import { deleteSession, SESSION_COOKIE } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) await deleteSession(getDb(), token);
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}

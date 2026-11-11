import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { assertSameOrigin, parseJsonBody } from "@/lib/security/request";
import { toErrorResponse } from "@/lib/utils/errors";
import { loginSchema } from "@/lib/validation/auth";
import { loginUser } from "@/modules/auth/service";
import { SESSION_COOKIE, sessionCookieOptions } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, loginSchema);
    const { user, session } = await loginUser(getDb(), input);
    const response = NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt));
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}

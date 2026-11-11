import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/utils/errors";
import { requireApiUser } from "@/modules/auth/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireApiUser();
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return toErrorResponse(error);
  }
}

import { requireAdmin } from "@/modules/auth/guards";
import { notImplemented, toErrorResponse } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return notImplemented("L'administration");
  } catch (error) {
    return toErrorResponse(error);
  }
}

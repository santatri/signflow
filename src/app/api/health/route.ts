import { getD1, getEnv, getR2 } from "@/lib/cloudflare/bindings";
import { toErrorResponse } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

type ServiceState = "connected" | "not_configured" | "error";

async function checkDatabase(): Promise<ServiceState> {
  const db = getD1();
  if (!db) return "not_configured";
  try {
    await db.prepare("SELECT 1").first();
    return "connected";
  } catch {
    return "error";
  }
}

async function checkStorage(): Promise<ServiceState> {
  const bucket = getR2();
  if (!bucket) return "not_configured";
  try {
    await bucket.list({ limit: 1 });
    return "connected";
  } catch {
    return "error";
  }
}

export async function GET() {
  try {
    const [database, storage] = await Promise.all([checkDatabase(), checkStorage()]);
    const hasError = database === "error" || storage === "error";
    const configured = getEnv() !== null;
    return Response.json(
      {
        status: hasError ? "degraded" : "ok",
        application: "SignFlow",
        runtime: configured ? "cloudflare" : "unavailable",
        services: { database, storage },
      },
      { status: hasError ? 503 : 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

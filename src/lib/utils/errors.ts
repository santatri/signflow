export type ErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "NOT_IMPLEMENTED"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

const HTTP_STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = HTTP_STATUS[code];
  }
}

export interface ErrorBody {
  error: { code: ErrorCode; message: string };
}

/** Convertit n'importe quelle erreur en réponse JSON sans fuite d'information interne. */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    const body: ErrorBody = { error: { code: error.code, message: error.message } };
    return Response.json(body, { status: error.status, headers: { "Cache-Control": "no-store" } });
  }
  console.error("Unhandled error", error instanceof Error ? error.name : "unknown");
  const body: ErrorBody = { error: { code: "INTERNAL_ERROR", message: "Une erreur interne est survenue." } };
  return Response.json(body, { status: 500, headers: { "Cache-Control": "no-store" } });
}

/** Réponse honnête pour les routes dont l'implémentation est prévue dans une phase ultérieure. */
export function notImplemented(feature: string): Response {
  return toErrorResponse(new AppError("NOT_IMPLEMENTED", `${feature} n'est pas encore disponible.`));
}

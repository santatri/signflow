import { afterEach, describe, expect, it, vi } from "vitest";
import { AppError, notImplemented, toErrorResponse } from "@/lib/utils/errors";

afterEach(() => vi.restoreAllMocks());

describe("toErrorResponse", () => {
  it("renvoie le statut et le code d'une AppError", async () => {
    const res = toErrorResponse(new AppError("NOT_FOUND", "Introuvable"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: "NOT_FOUND", message: "Introuvable" } });
  });
  it("masque les détails d'une erreur inattendue", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = toErrorResponse(new Error("secret interne: token=abc"));
    expect(res.status).toBe(500);
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain("secret");
  });
  it("notImplemented renvoie 501", () => {
    expect(notImplemented("X").status).toBe(501);
  });
});

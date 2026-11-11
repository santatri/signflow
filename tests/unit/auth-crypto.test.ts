import { describe, expect, it } from "vitest";
import { fromBase64Url, randomToken, sha256Hex, timingSafeEqual, toBase64Url } from "@/modules/auth/crypto";
import { hashPassword, verifyPassword } from "@/modules/auth/password";
import { assertSameOrigin } from "@/lib/security/request";
import { AppError } from "@/lib/utils/errors";

describe("crypto", () => {
  it("génère des jetons uniques de 43 caractères base64url (256 bits)", () => {
    const a = randomToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomToken()).not.toBe(a);
  });
  it("encode/décode en base64url sans perte", () => {
    const bytes = crypto.getRandomValues(new Uint8Array(33));
    expect([...fromBase64Url(toBase64Url(bytes))]).toEqual([...bytes]);
  });
  it("calcule un SHA-256 connu", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("compare en temps constant", () => {
    expect(timingSafeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true);
    expect(timingSafeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false);
    expect(timingSafeEqual(new Uint8Array([1]), new Uint8Array([1, 2]))).toBe(false);
  });
});

describe("mots de passe", () => {
  it("hache avec un sel différent à chaque fois et vérifie", async () => {
    const h1 = await hashPassword("Motdepasse123");
    const h2 = await hashPassword("Motdepasse123");
    expect(h1).not.toBe(h2);
    expect(h1.startsWith("pbkdf2-sha256$100000$")).toBe(true);
    expect(await verifyPassword("Motdepasse123", h1)).toBe(true);
    expect(await verifyPassword("motdepasse123", h1)).toBe(false);
  });
  it("rejette un hash mal formé ou aux itérations non supportées", async () => {
    expect(await verifyPassword("x", "n'importe quoi")).toBe(false);
    expect(await verifyPassword("x", "pbkdf2-sha256$999999999$AAAA$AAAA")).toBe(false);
  });
});

describe("assertSameOrigin", () => {
  const req = (headers: Record<string, string>) => new Request("https://signflow.test/api/auth/login", { method: "POST", headers });
  it("accepte une origine identique ou absente", () => {
    expect(() => assertSameOrigin(req({ origin: "https://signflow.test" }))).not.toThrow();
    expect(() => assertSameOrigin(req({}))).not.toThrow();
  });
  it("refuse une origine étrangère ou cross-site", () => {
    expect(() => assertSameOrigin(req({ origin: "https://evil.test" }))).toThrow(AppError);
    expect(() => assertSameOrigin(req({ "sec-fetch-site": "cross-site" }))).toThrow(AppError);
  });
});

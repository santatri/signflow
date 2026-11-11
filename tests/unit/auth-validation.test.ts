import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, loginSchema, registerSchema } from "@/lib/validation/auth";

const valid = { name: "Jean Dupont", email: "Jean@Example.com", password: "Motdepasse123", confirmPassword: "Motdepasse123" };

describe("registerSchema", () => {
  it("accepte des données valides et normalise l'email", () => {
    const r = registerSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("jean@example.com");
  });
  it("refuse un email invalide", () => {
    expect(registerSchema.safeParse({ ...valid, email: "pas-un-email" }).success).toBe(false);
  });
  it("refuse un mot de passe faible", () => {
    expect(registerSchema.safeParse({ ...valid, password: "court", confirmPassword: "court" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, password: "motdepassesansmajuscule1", confirmPassword: "motdepassesansmajuscule1" }).success).toBe(false);
  });
  it("refuse une confirmation différente", () => {
    const r = registerSchema.safeParse({ ...valid, confirmPassword: "Autre123456" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(["confirmPassword"]);
  });
  it("refuse les champs vides", () => {
    expect(registerSchema.safeParse({ name: "", email: "", password: "", confirmPassword: "" }).success).toBe(false);
  });
});

describe("loginSchema / forgotPasswordSchema", () => {
  it("exige email et mot de passe", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
  it("valide l'email de réinitialisation", () => {
    expect(forgotPasswordSchema.safeParse({ email: "x" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "x@y.fr" }).success).toBe(true);
  });
});

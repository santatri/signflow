import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "L'adresse email est obligatoire.")
  .email("Adresse email invalide.")
  .max(254, "Adresse email trop longue.")
  .transform((v) => v.toLowerCase());

const password = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
  .max(128, "Le mot de passe est trop long.")
  .regex(/[a-z]/, "Ajoutez au moins une minuscule.")
  .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
  .regex(/[0-9]/, "Ajoutez au moins un chiffre.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(100),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

export const forgotPasswordSchema = z.object({ email });

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;

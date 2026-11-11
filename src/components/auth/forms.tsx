"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { DevNotice } from "@/components/layout/dev-notice";
import {
  forgotPasswordSchema, loginSchema, registerSchema,
  type ForgotPasswordInput, type LoginInput, type RegisterInput,
} from "@/lib/validation/auth";

const NOTICE_MAIL = "L'envoi d'emails n'est pas encore configuré (Phase 3) : aucun email ne sera envoyé.";

function useNotConnected() {
  const [submitted, setSubmitted] = useState(false);
  return { submitted, onValid: () => setSubmitted(true) };
}

function Unavailable({ show }: { show: boolean }) {
  if (!show) return null;
  return <DevNotice>Cette action n&apos;est pas encore disponible : aucun email n&apos;a été envoyé.</DevNotice>;
}

/** Envoie les données à l'API d'authentification ; retourne un message d'erreur lisible ou null en cas de succès. */
function useAuthSubmit(endpoint: "login" | "register") {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  async function submit(data: unknown) {
    setError(null);
    try {
      const res = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setError(body?.error?.message ?? "Une erreur est survenue. Réessayez.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez votre connexion.");
    }
  }
  return { error, submit };
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>;
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const { error, submit } = useAuthSubmit("login");
  return (
    <Card>
      <CardHeader><CardTitle>Connexion</CardTitle><CardDescription>Accédez à votre espace SignFlow.</CardDescription></CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <FormField id="email" label="Adresse email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          </FormField>
          <FormField id="password" label="Mot de passe" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
          </FormField>
          <FormError message={error} />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Connexion…" : "Se connecter"}</Button>
          <div className="flex justify-between text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">Mot de passe oublié ?</Link>
            <Link href="/register" className="text-primary hover:underline">Créer un compte</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const { error, submit } = useAuthSubmit("register");
  return (
    <Card>
      <CardHeader><CardTitle>Créer un compte</CardTitle><CardDescription>Gratuit dans la version 1.</CardDescription></CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <FormField id="name" label="Nom complet" error={errors.name?.message}>
            <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          </FormField>
          <FormField id="email" label="Adresse email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          </FormField>
          <FormField id="password" label="Mot de passe" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
          </FormField>
          <FormField id="confirmPassword" label="Confirmer le mot de passe" error={errors.confirmPassword?.message}>
            <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
          </FormField>
          <FormError message={error} />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Création…" : "Créer mon compte"}</Button>
          <p className="text-center text-sm text-muted-foreground">Déjà inscrit ? <Link href="/login" className="text-primary hover:underline">Se connecter</Link></p>
        </form>
      </CardContent>
    </Card>
  );
}

export function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });
  const { submitted, onValid } = useNotConnected();
  return (
    <Card>
      <CardHeader><CardTitle>Mot de passe oublié</CardTitle><CardDescription>Nous vous enverrons un lien de réinitialisation.</CardDescription></CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4">
          <DevNotice>{NOTICE_MAIL}</DevNotice>
          <FormField id="email" label="Adresse email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          </FormField>
          <Unavailable show={submitted} />
          <Button type="submit">Envoyer le lien</Button>
          <Link href="/login" className="text-center text-sm text-primary hover:underline">Retour à la connexion</Link>
        </form>
      </CardContent>
    </Card>
  );
}

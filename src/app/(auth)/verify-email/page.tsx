import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DevNotice } from "@/components/layout/dev-notice";

export const metadata: Metadata = { title: "Vérification de l'email" };

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader>
        <MailCheck className="h-8 w-8 text-primary" aria-hidden />
        <CardTitle>Vérification de l&apos;email</CardTitle>
        <CardDescription>La vérification par lien sera disponible avec l&apos;authentification.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DevNotice>Cette page est une interface préparée : aucun email de vérification n&apos;est envoyé pour le moment.</DevNotice>
        <Button asChild variant="outline"><Link href="/login">Retour à la connexion</Link></Button>
      </CardContent>
    </Card>
  );
}

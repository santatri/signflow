import Link from "next/link";
import { CheckCircle2, Download, FileUp, ImageUp, Keyboard, MousePointerClick, PenLine, ShieldCheck } from "lucide-react";
import { DocumentPreview } from "@/components/documents/document-preview";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { faqItems } from "@/config/faq";
import { siteConfig } from "@/config/site";

const features = [
  { icon: FileUp, title: "Importation de documents", text: "Importez vos fichiers PDF depuis votre ordinateur ou votre téléphone." },
  { icon: PenLine, title: "Signature manuscrite", text: "Dessinez votre signature à la souris ou au doigt." },
  { icon: Keyboard, title: "Signature par nom", text: "Générez une signature élégante en saisissant simplement votre nom." },
  { icon: ImageUp, title: "Signature par image", text: "Importez une image de votre signature existante." },
  { icon: MousePointerClick, title: "Positionnement sur PDF", text: "Placez et redimensionnez votre signature exactement où vous le souhaitez." },
  { icon: ShieldCheck, title: "Téléchargement sécurisé", text: "Vos fichiers restent privés et sont accessibles uniquement par vous." },
];

const steps = [
  { title: "Importez votre document", text: "Sélectionnez le PDF à signer." },
  { title: "Ajoutez votre signature", text: "Dessinez-la, saisissez votre nom ou importez une image." },
  { title: "Téléchargez votre document signé", text: "Récupérez votre PDF signé en un clic." },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="animate-fade-up">
          <p className="mb-4 inline-flex rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">Version 1 gratuite</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">{siteConfig.tagline}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{siteConfig.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/editor/new">Signer un document</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/register">Créer un compte gratuitement</Link></Button>
          </div>
        </div>
        <DocumentPreview />
      </section>

      <section id="fonctionnalites" className="scroll-mt-20 border-y border-border bg-card py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold tracking-tight">Fonctionnalités</h2>
          <p className="mt-2 text-muted-foreground">Tout ce qu&apos;il faut pour signer un document, sans complexité.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon className="h-5 w-5" aria-hidden /></div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="comment-ca-marche" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Comment ça marche</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
              <div>
                <h3 className="font-semibold">Étape {i + 1} : {s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-success-soft py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
          <h2 className="text-3xl font-bold tracking-tight">Gratuit dans sa première version</h2>
          <p className="text-muted-foreground">SignFlow est proposé gratuitement dans sa version 1. D&apos;autres fonctionnalités seront ajoutées progressivement.</p>
          <Button asChild variant="success" size="lg"><Link href="/register"><Download className="h-4 w-4" aria-hidden />Commencer gratuitement</Link></Button>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Questions fréquentes</h2>
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-card">
          {faqItems.slice(0, 3).map((item) => (
            <details key={item.question} className="group p-4">
              <summary className="cursor-pointer font-medium">{item.question}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm"><Link href="/faq" className="text-primary hover:underline">Voir toutes les questions</Link></p>
      </section>
    </>
  );
}

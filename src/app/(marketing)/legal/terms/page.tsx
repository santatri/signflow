import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Conditions d&apos;utilisation</h1>
      <p className="mt-4 text-muted-foreground">Les conditions d&apos;utilisation seront publiées avant l&apos;ouverture publique du service.</p>
    </div>
  );
}

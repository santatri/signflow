import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confidentialité" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Confidentialité</h1>
      <p className="mt-4 text-muted-foreground">La politique de confidentialité complète sera publiée avant l&apos;ouverture publique du service. Principe de base : les documents sont privés et ne sont jamais accessibles par des liens publics permanents.</p>
    </div>
  );
}

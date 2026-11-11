import type { Metadata } from "next";

export const metadata: Metadata = { title: "Signature d'un document" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Signature d&apos;un document</h1>
      <p className="mt-4 text-muted-foreground">Les demandes de signature par lien seront développées dans une phase ultérieure.</p>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "À propos" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">À propos</h1>
      <p className="mt-4 text-muted-foreground">SignFlow est une plateforme de signature électronique pensée pour être simple et accessible. Le projet est en cours de développement.</p>
    </div>
  );
}

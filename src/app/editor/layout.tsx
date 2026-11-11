import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/modules/auth/current-user";

export const dynamic = "force-dynamic";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4">
        <Logo />
        {user ? (
          <Button asChild variant="outline" size="sm"><Link href="/dashboard/documents">Mes documents</Link></Button>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm"><Link href="/login">Se connecter</Link></Button>
            <Button asChild size="sm"><Link href="/register">Créer un compte</Link></Button>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}

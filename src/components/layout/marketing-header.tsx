"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketingNav } from "@/config/site";
import { Logo } from "./logo";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-6 md:flex">
          {marketingNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm"><Link href="/login">Se connecter</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/register">Créer un compte</Link></Button>
          <Button asChild size="sm"><Link href="/editor/new">Signer gratuitement</Link></Button>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open ? (
        <div id="mobile-menu" className="border-t border-border bg-card px-4 py-4 md:hidden">
          <nav aria-label="Navigation mobile" className="flex flex-col gap-3">
            {marketingNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="py-1 text-sm">{item.label}</Link>
            ))}
            <Button asChild variant="outline"><Link href="/login">Se connecter</Link></Button>
            <Button asChild variant="outline"><Link href="/register">Créer un compte</Link></Button>
            <Button asChild><Link href="/editor/new">Signer gratuitement</Link></Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

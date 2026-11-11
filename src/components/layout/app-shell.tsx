"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { adminNav } from "@/components/dashboard/admin-nav";
import { dashboardNav } from "@/components/dashboard/nav";
import { LogoutButton } from "./logout-button";
import { Logo } from "./logo";

export interface NavEntry { label: string; href: string; icon: LucideIcon; exact?: boolean }

function NavList({ items, onNavigate }: { items: NavEntry[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Navigation latérale">
      {items.map(({ label, href, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

const NAVS = { dashboard: dashboardNav, admin: adminNav } as const;

// `nav` est une clé (sérialisable) : les composants d'icônes ne peuvent pas traverser la frontière serveur -> client.
export function AppShell({ nav, title, children, badge, userName }: { nav: keyof typeof NAVS; title: string; children: React.ReactNode; badge?: string; userName?: string }) {
  const items = NAVS[nav];
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-border bg-card p-4 md:block">
        <Logo className="mb-6 px-2" />
        <NavList items={items} />
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <span className="font-semibold">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            {badge ? <span className="hidden rounded-full bg-warning-soft px-3 py-1 text-xs font-medium text-warning sm:inline">{badge}</span> : null}
            {userName ? <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span> : null}
            {userName ? <LogoutButton /> : null}
          </div>
        </header>
        {open ? (
          <div className="border-b border-border bg-card p-4 md:hidden">
            <NavList items={items} onNavigate={() => setOpen(false)} />
          </div>
        ) : null}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

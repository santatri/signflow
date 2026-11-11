import Link from "next/link";
import { Logo } from "./logo";

const links = [
  { label: "À propos", href: "/about" },
  { label: "Confidentialité", href: "/legal/privacy" },
  { label: "Conditions d'utilisation", href: "/legal/terms" },
  { label: "Contact", href: "/legal/contact" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-sm text-muted-foreground">Signature électronique simple et gratuite.</p>
        </div>
        <nav aria-label="Pied de page" className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground">{l.label}</Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} SignFlow</p>
    </footer>
  );
}

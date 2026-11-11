import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${siteConfig.name} — Signature électronique gratuite`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#2563eb" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

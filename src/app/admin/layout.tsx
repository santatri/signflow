import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { DevNotice } from "@/components/layout/dev-notice";
import { requireAdminPage } from "@/modules/auth/current-user";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  return (
    <AppShell nav="admin" title="Administration" badge="Interface préparée" userName={user.name}>
      <div className="mb-6">
        <DevNotice>
          Accès réservé au rôle « admin », vérifié côté serveur. Les pages d&apos;administration n&apos;affichent pas encore de données.
        </DevNotice>
      </div>
      {children}
    </AppShell>
  );
}

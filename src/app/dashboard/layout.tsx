import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/modules/auth/current-user";

export const metadata: Metadata = { title: "Tableau de bord", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell nav="dashboard" title="Tableau de bord" userName={user.name}>
      {children}
    </AppShell>
  );
}

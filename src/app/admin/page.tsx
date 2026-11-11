import { FileText, ScrollText, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader title="Vue générale" description="Indicateurs globaux de la plateforme." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Utilisateurs" value={null} icon={Users} />
        <StatCard label="Documents" value={null} icon={FileText} />
        <StatCard label="Événements journalisés" value={null} icon={ScrollText} />
      </div>
      <div className="mt-8"><EmptyState title="Aucune donnée disponible" description="Les indicateurs seront alimentés par la base de données dans une prochaine phase." /></div>
    </>
  );
}

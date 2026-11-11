import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function Page() {
  return (
    <>
      <PageHeader title="Journaux d'activité" description="Historique des actions sensibles (audit)." />
      <EmptyState title="Aucune donnée disponible" description="Le journal d'audit sera alimenté lorsque les actions métier seront implémentées." />
    </>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function Page() {
  return (
    <>
      <PageHeader title="Paramètres" description="Paramètres globaux de l'application." />
      <EmptyState title="Aucune donnée disponible" description="Les paramètres globaux seront gérés via la table app_settings dans une prochaine phase." />
    </>
  );
}

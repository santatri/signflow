import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function Page() {
  return (
    <>
      <PageHeader title="Statistiques" description="Statistiques d'utilisation de la plateforme." />
      <EmptyState title="Aucune donnée disponible" description="Les statistiques seront calculées à partir des données réelles dans une prochaine phase." />
    </>
  );
}

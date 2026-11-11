import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function Page() {
  return (
    <>
      <PageHeader title="Documents" description="Supervision des documents de la plateforme." />
      <EmptyState title="Aucune donnée disponible" description="La supervision des documents sera disponible dans une prochaine phase." />
    </>
  );
}

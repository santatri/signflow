import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function Page() {
  return (
    <>
      <PageHeader title="Demandes envoyées" description="Suivez les demandes de signature que vous avez envoyées." />
      <EmptyState title="Aucune demande envoyée" description="Les demandes de signature par email seront disponibles dans une prochaine phase." />
    </>
  );
}

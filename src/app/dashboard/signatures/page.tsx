import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function Page() {
  return (
    <>
      <PageHeader title="Mes signatures" description="Gérez vos signatures enregistrées." />
      <EmptyState title="Aucune signature enregistrée" description="La création de signatures sera disponible dans une prochaine phase." />
    </>
  );
}

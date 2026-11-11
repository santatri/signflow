import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function Page() {
  return (
    <>
      <PageHeader title="Documents reçus" description="Documents que d'autres personnes vous ont demandé de signer." />
      <EmptyState title="Aucun document reçu" description="Les documents reçus apparaîtront ici dans une prochaine phase." />
    </>
  );
}

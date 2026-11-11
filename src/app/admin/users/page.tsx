import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function Page() {
  return (
    <>
      <PageHeader title="Utilisateurs" description="Gestion des comptes utilisateurs." />
      <EmptyState title="Aucune donnée disponible" description="La liste des utilisateurs sera disponible avec l'authentification et le rôle administrateur." />
    </>
  );
}

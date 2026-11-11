import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export default function Page() {
  return (
    <>
      <PageHeader title="Paramètres" description="Gérez votre compte et vos préférences." />
      <EmptyState title="Paramètres indisponibles" description="Les paramètres de compte seront disponibles avec l'authentification." />
    </>
  );
}

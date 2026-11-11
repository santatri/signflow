import Link from "next/link";
import { FileUp } from "lucide-react";
import { DocumentTable } from "@/components/documents/document-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { getDb } from "@/lib/db/client";
import { requireUser } from "@/modules/auth/current-user";
import { listDocuments } from "@/modules/documents/service";

export default async function Page() {
  const user = await requireUser();
  const rows = await listDocuments(getDb(), { kind: "user", id: user.id });
  return (
    <>
      <PageHeader
        title="Mes documents"
        description="Retrouvez tous vos documents importés et signés."
        action={<Button asChild><Link href="/editor/new"><FileUp className="h-4 w-4" aria-hidden />Importer un document</Link></Button>}
      />
      <Card>
        <CardContent className="p-2 sm:p-4">
          {rows.length === 0 ? (
            <EmptyState title="Aucun document" description="Importez un PDF pour le signer : il apparaîtra ici." />
          ) : (
            <DocumentTable rows={rows} />
          )}
        </CardContent>
      </Card>
    </>
  );
}

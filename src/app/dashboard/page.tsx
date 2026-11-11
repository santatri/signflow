import Link from "next/link";
import { Clock, FileCheck2, FileUp, Send } from "lucide-react";
import { DocumentTable } from "@/components/documents/document-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { getDb } from "@/lib/db/client";
import { requireUser } from "@/modules/auth/current-user";
import { countDocumentsByStatus, listDocuments } from "@/modules/documents/service";

export default async function DashboardPage() {
  const user = await requireUser();
  const actor = { kind: "user", id: user.id } as const;
  const db = getDb();
  const [counts, recent] = await Promise.all([countDocumentsByStatus(db, actor), listDocuments(db, actor, 5)]);
  return (
    <>
      <PageHeader
        title="Vue générale"
        description="Suivez vos documents et vos demandes de signature."
        action={<Button asChild><Link href="/editor/new"><FileUp className="h-4 w-4" aria-hidden />Importer un document</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents importés" value={counts.total} icon={FileUp} />
        <StatCard label="Documents signés" value={counts.signed} icon={FileCheck2} />
        <StatCard label="Documents en attente" value={counts.awaiting} icon={Clock} />
        <StatCard label="Demandes envoyées" value={null} icon={Send} />
      </div>
      <Card className="mt-8">
        <CardHeader><CardTitle>Documents récents</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState title="Aucun document pour le moment" description="Importez un PDF pour commencer : il apparaîtra ici." />
          ) : (
            <DocumentTable rows={recent} />
          )}
        </CardContent>
      </Card>
    </>
  );
}

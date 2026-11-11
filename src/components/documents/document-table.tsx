import Link from "next/link";
import { Download, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDocumentStatusLabel } from "@/config/statuses";
import { formatBytes } from "@/lib/utils/format";

export interface DocumentRow { id: string; title: string; status: string; size: number; signedKey: string | null; updatedAt: Date }

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export function DocumentTable({ rows }: { rows: DocumentRow[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="hidden sm:table-cell">Taille</TableHead>
            <TableHead className="hidden md:table-cell">Modifié (UTC)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="max-w-[16rem] truncate font-medium">{d.title}</TableCell>
              <TableCell><Badge variant={d.status === "signed" ? "success" : "default"}>{getDocumentStatusLabel(d.status)}</Badge></TableCell>
              <TableCell className="hidden sm:table-cell">{formatBytes(d.size)}</TableCell>
              <TableCell className="hidden md:table-cell">{dateFormat.format(d.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline"><Link href={`/editor/${d.id}`}><PenLine className="h-4 w-4" aria-hidden />{d.signedKey ? "Ouvrir" : "Signer"}</Link></Button>
                  <Button asChild size="sm" variant="ghost"><a href={`/api/documents/${d.id}/file?download=1`} aria-label={`Télécharger ${d.title}`}><Download className="h-4 w-4" aria-hidden /></a></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

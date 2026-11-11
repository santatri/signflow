import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** `value` vaut `null` tant que la donnée réelle n'est pas disponible : on affiche « — », jamais un faux chiffre. */
export function StatCard({ label, value, icon: Icon }: { label: string; value: number | null; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon className="h-5 w-5" aria-hidden /></div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold" aria-label={value === null ? "Non disponible" : undefined}>{value === null ? "—" : value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

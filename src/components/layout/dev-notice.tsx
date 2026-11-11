import { Info } from "lucide-react";

export function DevNotice({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="flex gap-2 rounded-md border border-warning/30 bg-warning-soft p-3 text-sm text-warning">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}

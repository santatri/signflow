import { PenLine } from "lucide-react";

/** Illustration décorative d'un PDF signé (aucune donnée réelle). */
export function DocumentPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-3xl bg-primary-soft" />
      <div className="relative rotate-2 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <span className="rounded bg-danger-soft px-2 py-0.5 text-[10px] font-semibold text-danger">PDF</span>
        </div>
        <div className="space-y-2">
          {[100, 92, 96, 70, 100, 84, 60].map((w, i) => (
            <div key={i} className="h-2 rounded bg-slate-100" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-8 flex items-end justify-between">
          <div>
            <PenLine className="mb-1 h-5 w-5 text-primary" />
            <svg viewBox="0 0 160 40" className="h-10 w-36 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 30c12-26 20-28 24-18s-8 22 2 22 12-18 24-18 6 14 16 12 12-10 22-10 20 6 36 2" />
            </svg>
            <div className="mt-1 h-px w-40 bg-slate-300" />
          </div>
          <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">Signé</span>
        </div>
      </div>
    </div>
  );
}

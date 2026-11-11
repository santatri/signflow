import { AlertTriangle, FileText, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function StateShell({ icon: Icon, tone, title, description, action, className }: StateProps & { icon: LucideIcon; tone: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center", className)}>
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", tone)}>
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

export function EmptyState(props: StateProps) {
  return <StateShell icon={FileText} tone="bg-primary-soft text-primary" {...props} />;
}

export function ErrorState(props: StateProps) {
  return <StateShell icon={AlertTriangle} tone="bg-danger-soft text-danger" {...props} />;
}

export function LoadingState({ label = "Chargement…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn("flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground", className)}>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

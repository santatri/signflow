import { cn } from "@/lib/utils/cn";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}
export function TableHeader(props: React.ComponentProps<"thead">) {
  return <thead className="border-b border-border text-muted-foreground" {...props} />;
}
export function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody className="divide-y divide-border" {...props} />;
}
export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("hover:bg-muted/50", className)} {...props} />;
}
export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("px-4 py-3 font-medium", className)} {...props} />;
}
export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3", className)} {...props} />;
}

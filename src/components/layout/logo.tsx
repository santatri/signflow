import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold", className)} aria-label="SignFlow — accueil">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" width={32} height={32} />
      <span className="text-lg tracking-tight">SignFlow</span>
    </Link>
  );
}

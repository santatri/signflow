import { FileText, LayoutDashboard, PenLine, Send, Settings, Inbox } from "lucide-react";
import type { NavEntry } from "@/components/layout/app-shell";

export const dashboardNav: NavEntry[] = [
  { label: "Vue générale", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Mes documents", href: "/dashboard/documents", icon: FileText },
  { label: "Demandes envoyées", href: "/dashboard/requests", icon: Send },
  { label: "Documents reçus", href: "/dashboard/received", icon: Inbox },
  { label: "Mes signatures", href: "/dashboard/signatures", icon: PenLine },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

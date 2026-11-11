import { BarChart3, FileText, LayoutDashboard, ScrollText, Settings, Users } from "lucide-react";
import type { NavEntry } from "@/components/layout/app-shell";

export const adminNav: NavEntry[] = [
  { label: "Vue générale", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Utilisateurs", href: "/admin/users", icon: Users },
  { label: "Documents", href: "/admin/documents", icon: FileText },
  { label: "Statistiques", href: "/admin/statistics", icon: BarChart3 },
  { label: "Journaux d'activité", href: "/admin/logs", icon: ScrollText },
  { label: "Paramètres", href: "/admin/settings", icon: Settings },
];

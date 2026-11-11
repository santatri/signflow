"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }
  return (
    <Button variant="ghost" size="sm" onClick={logout} disabled={pending}>
      <LogOut className="h-4 w-4" aria-hidden /> Se déconnecter
    </Button>
  );
}

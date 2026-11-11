"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { MAX_DOCUMENT_SIZE_BYTES } from "@/config/statuses";
import { formatBytes } from "@/lib/utils/format";

export function UploadPanel() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") return setError("Seuls les fichiers PDF sont acceptés.");
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) return setError(`Le fichier (${formatBytes(file.size)}) dépasse la taille maximale de 10 Mo.`);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/documents", { method: "POST", body });
      const json = (await res.json().catch(() => null)) as { document?: { id: string }; error?: { message?: string } } | null;
      if (!res.ok || !json?.document) {
        setError(json?.error?.message ?? "L'import a échoué. Réessayez.");
        return;
      }
      router.push(`/editor/${json.document.id}`);
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez votre connexion.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Importez votre document</h1>
      <p className="mt-2 text-muted-foreground">Aucun compte n&apos;est nécessaire pour signer. Format PDF, 10 Mo maximum.</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); void upload(e.dataTransfer.files[0]); }}
        className={cn("mt-8 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed bg-card p-12 text-center transition-colors", dragging ? "border-primary bg-primary-soft" : "border-border")}
      >
        {busy ? <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden /> : <FileUp className="h-10 w-10 text-primary" aria-hidden />}
        <p className="font-medium">{busy ? "Import en cours…" : "Glissez votre PDF ici"}</p>
        <Button type="button" disabled={busy} onClick={() => input.current?.click()}>Choisir un fichier</Button>
        <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" aria-label="Choisir un fichier PDF" onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {error ? <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

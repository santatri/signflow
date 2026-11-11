"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { CheckCircle2, Download, Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignatureMaker, type SignatureResult } from "@/components/signature-pad/signature-maker";
import { PdfPage } from "./pdf-page";
import type { Placement } from "./placement-box";

const MAX_WIDTH = 820;

export function PdfEditor({ documentId, title, initiallySigned, signedIn }: { documentId: string; title: string; initiallySigned: boolean; signedIn: boolean }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [reload, setReload] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [signature, setSignature] = useState<SignatureResult | null>(null);
  const [making, setMaking] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(initiallySigned);
  const [justSigned, setJustSigned] = useState(false);
  const [width, setWidth] = useState(MAX_WIDTH);
  const wrap = useRef<HTMLDivElement>(null);

  // Largeur adaptée à l'écran (mobile compris).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const update = () => setWidth(Math.max(280, Math.min(MAX_WIDTH, Math.floor(el.clientWidth))));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // pdf.js n'est chargé que dans le navigateur.
  useEffect(() => {
    let cancelled = false;
    let loading: { destroy: () => Promise<void> } | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const res = await fetch(`/api/documents/${documentId}/file`, { cache: "no-store" });
        if (!res.ok) throw new Error("fetch");
        const task = pdfjs.getDocument({ data: new Uint8Array(await res.arrayBuffer()) });
        loading = task;
        const doc = await task.promise;
        if (cancelled) return void task.destroy();
        setPdf(doc);
      } catch {
        if (!cancelled) setLoadError("Impossible d'afficher ce document.");
      }
    })();
    return () => { cancelled = true; void loading?.destroy(); };
  }, [documentId, reload]);

  const onPlace = useCallback((page: number, xc: number, yc: number, pageRatio: number) => {
    if (!signature) return;
    const w = 0.28;
    const height = Math.min((w * pageRatio) / signature.ratio, 1); // largeur/hauteur de page ÷ ratio de l'image
    const x = Math.min(Math.max(xc - w / 2, 0), 1 - w);
    const y = Math.min(Math.max(yc - height / 2, 0), 1 - height);
    setPlacements((prev) => [...prev, { id: crypto.randomUUID(), page, x, y, width: w, height }]);
    setPlacing(false);
  }, [signature]);

  async function sign() {
    if (!signature || placements.length === 0) return;
    setSigning(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureType: signature.type,
          signatureImage: signature.dataUrl,
          placements: placements.map(({ page, x, y, width: w, height: h }) => ({ page, x, y, width: w, height: h })),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setError(body?.error?.message ?? "La signature a échoué. Réessayez.");
        return;
      }
      setPlacements([]);
      setSigned(true);
      setJustSigned(true);
      setLoadError(null);
      setReload((n) => n + 1); // recharge le PDF signé pour vérifier le résultat à l'écran
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{signed ? "Document signé" : "Ajoutez votre signature puis placez-la sur le document."}</p>
        </div>
        {signed ? (
          <Button asChild><a href={`/api/documents/${documentId}/file?download=1`}><Download className="h-4 w-4" aria-hidden />Télécharger le PDF signé</a></Button>
        ) : null}
      </div>

      {justSigned ? (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-md bg-success-soft px-3 py-2 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Document signé. Vérifiez le résultat ci-dessous puis téléchargez-le.
          {signedIn ? <Link href="/dashboard/documents" className="ml-auto underline">Mes documents</Link> : null}
        </p>
      ) : null}
      {!signedIn ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Vous n&apos;êtes pas connecté : ce document n&apos;est conservé que 7 jours sur ce navigateur. <Link href="/register" className="text-primary underline">Créez un compte</Link> pour le retrouver partout.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {making ? (
          <SignatureMaker onCancel={() => setMaking(false)} onConfirm={(r) => { setSignature(r); setPlacements([]); setMaking(false); setPlacing(true); }} />
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
            <Button type="button" variant={signature ? "outline" : "default"} onClick={() => setMaking(true)}>
              <PenLine className="h-4 w-4" aria-hidden />{signature ? "Changer de signature" : "Créer ma signature"}
            </Button>
            {signature ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={signature.dataUrl} alt="Ma signature" className="h-10 max-w-40 rounded border border-border bg-white object-contain p-1" />
                <Button type="button" variant={placing ? "default" : "outline"} onClick={() => setPlacing((v) => !v)} aria-pressed={placing}>
                  {placing ? "Cliquez sur la page…" : "Placer sur le document"}
                </Button>
              </>
            ) : null}
            <Button type="button" className="ml-auto" disabled={!signature || placements.length === 0 || signing} onClick={sign}>
              {signing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {signing ? "Signature…" : `Signer le document${placements.length > 1 ? ` (${placements.length})` : ""}`}
            </Button>
          </div>
        )}
        {error ? <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </div>

      <div ref={wrap} className="mt-6 rounded-lg bg-muted p-2 sm:p-4">
        {loadError ? (
          <p role="alert" className="py-16 text-center text-sm text-red-700">{loadError}</p>
        ) : !pdf ? (
          <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden />Chargement du document…</p>
        ) : (
          <div className="flex flex-col gap-4">
            {Array.from({ length: pdf.numPages }, (_, i) => (
              <PdfPage
                key={`${reload}-${i + 1}`}
                pdf={pdf}
                pageNumber={i + 1}
                width={Math.max(260, width - 16)}
                placing={placing}
                signature={signature}
                placements={placements}
                onPlace={onPlace}
                onChange={(p) => setPlacements((prev) => prev.map((x) => (x.id === p.id ? p : x)))}
                onRemove={(id) => setPlacements((prev) => prev.filter((x) => x.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

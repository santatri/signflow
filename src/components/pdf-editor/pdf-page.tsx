"use client";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PlacementBox, type Placement } from "./placement-box";

export function PdfPage({ pdf, pageNumber, width, placing, signature, placements, onPlace, onChange, onRemove }: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  placing: boolean;
  signature: { dataUrl: string; ratio: number } | null;
  placements: Placement[];
  onPlace: (page: number, xFrac: number, yFrac: number, pageRatio: number) => void;
  onChange: (p: Placement) => void;
  onRemove: (id: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let task: { cancel: () => void; promise: Promise<unknown> } | null = null;
    (async () => {
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: width / base.width });
      const dpr = window.devicePixelRatio || 1;
      const el = canvas.current;
      if (cancelled || !el) return;
      el.width = Math.floor(viewport.width * dpr);
      el.height = Math.floor(viewport.height * dpr);
      setSize({ w: viewport.width, h: viewport.height });
      task = page.render({ canvas: el, viewport, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined });
      try { await task.promise; } catch { /* rendu annulé : normal lors d'un redimensionnement */ }
    })();
    return () => { cancelled = true; task?.cancel(); };
  }, [pdf, pageNumber, width]);

  function click(e: React.MouseEvent<HTMLDivElement>) {
    if (!placing || !signature || !size) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onPlace(pageNumber, (e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height, rect.width / rect.height);
  }

  return (
    <div
      ref={box}
      onClick={click}
      className={`relative mx-auto bg-white shadow-md ${placing ? "cursor-crosshair ring-2 ring-primary/40" : ""}`}
      style={{ width, height: size?.h ?? width * 1.414 }}
      data-page={pageNumber}
    >
      <canvas ref={canvas} className="block" style={{ width: size?.w, height: size?.h }} aria-label={`Page ${pageNumber}`} />
      {signature ? placements.filter((p) => p.page === pageNumber).map((p) => (
        <PlacementBox key={p.id} placement={p} dataUrl={signature.dataUrl} ratio={signature.ratio} containerRef={box} onChange={onChange} onRemove={() => onRemove(p.id)} />
      )) : null}
    </div>
  );
}

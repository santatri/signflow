"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export type SignatureType = "drawn" | "typed" | "image";
export interface SignatureResult { dataUrl: string; type: SignatureType; ratio: number }

const INK = "#0b1f4d";
const MAX_DATA_URL = 900_000;
const FONTS = [
  { label: "Script", css: '"Brush Script MT", "Segoe Script", "Snell Roundhand", cursive' },
  { label: "Manuscrit", css: '"Lucida Handwriting", "Bradley Hand", "Segoe Print", cursive' },
  { label: "Classique", css: 'italic "Georgia", "Times New Roman", serif' },
];

/** Recadre un canvas sur le contenu non transparent, avec une petite marge. */
function cropToContent(src: HTMLCanvasElement, pad = 8): HTMLCanvasElement | null {
  const ctx = src.getContext("2d");
  if (!ctx) return null;
  const { width, height } = src;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad);
  const w = Math.min(width, maxX + pad) - x0, h = Math.min(height, maxY + pad) - y0;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d")!.drawImage(src, x0, y0, w, h, 0, 0, w, h);
  return out;
}

function toResult(canvas: HTMLCanvasElement | null, type: SignatureType): SignatureResult | null {
  if (!canvas || canvas.width === 0 || canvas.height === 0) return null;
  let dataUrl = canvas.toDataURL("image/png");
  if (dataUrl.length > MAX_DATA_URL) {
    // PNG trop lourd (photo) : repli en JPEG sur fond blanc.
    const flat = document.createElement("canvas");
    flat.width = canvas.width;
    flat.height = canvas.height;
    const c = flat.getContext("2d")!;
    c.fillStyle = "#fff";
    c.fillRect(0, 0, flat.width, flat.height);
    c.drawImage(canvas, 0, 0);
    dataUrl = flat.toDataURL("image/jpeg", 0.85);
  }
  if (dataUrl.length > MAX_DATA_URL) return null;
  return { dataUrl, type, ratio: canvas.width / canvas.height };
}

function DrawTab({ onResult }: { onResult: (r: SignatureResult | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) { ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = INK; }
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    const ctx = ref.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(last.current.x, last.current.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;
    const p = point(e);
    const ctx = ref.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }
  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    onResult(toResult(cropToContent(ref.current!), "drawn"));
  }
  function clear() {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    onResult(null);
  }

  return (
    <div>
      <canvas
        ref={ref}
        width={900}
        height={300}
        aria-label="Zone de dessin de la signature"
        className="w-full touch-none rounded-md border border-border bg-white"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={clear}>Effacer</Button>
    </div>
  );
}

function TypeTab({ onResult }: { onResult: (r: SignatureResult | null) => void }) {
  const [name, setName] = useState("");
  const [font, setFont] = useState(0);
  const preview = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const text = name.trim();
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    ctx.font = `90px ${FONTS[font]!.css}`;
    const w = Math.ceil(ctx.measureText(text || " ").width) + 60;
    c.width = Math.min(w, 1600);
    c.height = 170;
    ctx.font = `90px ${FONTS[font]!.css}`;
    ctx.fillStyle = INK;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 30, 85, c.width - 60);
    const out = text ? cropToContent(c) : null;
    onResult(toResult(out, "typed"));
    const p = preview.current;
    if (p) {
      p.width = c.width;
      p.height = c.height;
      p.getContext("2d")!.drawImage(c, 0, 0);
    }
  }, [name, font, onResult]);

  return (
    <div className="space-y-3">
      <Input value={name} maxLength={60} placeholder="Votre nom" aria-label="Nom à utiliser comme signature" onChange={(e) => setName(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        {FONTS.map((f, i) => (
          <button key={f.label} type="button" onClick={() => setFont(i)} aria-pressed={font === i}
            className={cn("rounded-md border px-3 py-1.5 text-sm", font === i ? "border-primary bg-primary-soft text-primary" : "border-border")}>
            <span style={{ font: `20px ${f.css}` }}>{name.trim() || f.label}</span>
          </button>
        ))}
      </div>
      <canvas ref={preview} className="h-24 w-full rounded-md border border-border bg-white object-contain" aria-label="Aperçu de la signature" />
    </div>
  );
}

function ImageTab({ onResult }: { onResult: (r: SignatureResult | null) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function pick(file: File | undefined) {
    setError(null);
    onResult(null);
    setPreview(null);
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) return setError("Formats acceptés : PNG ou JPEG.");
    if (file.size > 5 * 1024 * 1024) return setError("Image trop lourde (5 Mo maximum).");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 800 / img.width);
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const result = toResult(c, "image");
      if (!result) return setError("Image trop volumineuse après traitement. Utilisez une image plus petite.");
      setPreview(result.dataUrl);
      onResult(result);
    };
    img.onerror = () => { URL.revokeObjectURL(url); setError("Image illisible."); };
    img.src = url;
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="image/png,image/jpeg" aria-label="Importer une image de signature" onChange={(e) => pick(e.target.files?.[0])} className="block w-full text-sm" />
      <p className="text-xs text-muted-foreground">Un PNG à fond transparent donne le meilleur rendu.</p>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Aperçu de la signature importée" className="max-h-28 rounded-md border border-border bg-white p-2" />
      ) : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

const TABS: { id: SignatureType; label: string }[] = [
  { id: "drawn", label: "Dessiner" },
  { id: "typed", label: "Saisir mon nom" },
  { id: "image", label: "Importer une image" },
];

export function SignatureMaker({ onConfirm, onCancel }: { onConfirm: (r: SignatureResult) => void; onCancel: () => void }) {
  const [tab, setTab] = useState<SignatureType>("drawn");
  const [result, setResult] = useState<SignatureResult | null>(null);
  const [mounted, setMounted] = useState(0);

  function changeTab(t: SignatureType) {
    setTab(t);
    setResult(null);
    setMounted((n) => n + 1);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div role="tablist" aria-label="Type de signature" className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => changeTab(t.id)}
            className={cn("rounded-md px-3 py-1.5 text-sm font-medium", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
            {t.label}
          </button>
        ))}
      </div>
      <div key={mounted}>
        {tab === "drawn" ? <DrawTab onResult={setResult} /> : null}
        {tab === "typed" ? <TypeTab onResult={setResult} /> : null}
        {tab === "image" ? <ImageTab onResult={setResult} /> : null}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button type="button" disabled={!result} onClick={() => result && onConfirm(result)}>Utiliser cette signature</Button>
      </div>
    </div>
  );
}

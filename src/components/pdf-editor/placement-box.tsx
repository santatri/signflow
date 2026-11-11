"use client";
import { useRef } from "react";
import { X } from "lucide-react";

export interface Placement { id: string; page: number; x: number; y: number; width: number; height: number }

const MIN_WIDTH = 0.05;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Signature posée sur une page : déplaçable, redimensionnable (ratio conservé), supprimable. Coordonnées relatives (0 à 1). */
export function PlacementBox({ placement, dataUrl, ratio, containerRef, onChange, onRemove }: {
  placement: Placement;
  dataUrl: string;
  ratio: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onChange: (next: Placement) => void;
  onRemove: () => void;
}) {
  const start = useRef<{ px: number; py: number; p: Placement } | null>(null);

  function begin(e: React.PointerEvent) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { px: e.clientX, py: e.clientY, p: placement };
  }

  function drag(e: React.PointerEvent) {
    const s = start.current, rect = containerRef.current?.getBoundingClientRect();
    if (!s || !rect) return;
    onChange({
      ...s.p,
      x: clamp(s.p.x + (e.clientX - s.px) / rect.width, 0, 1 - s.p.width),
      y: clamp(s.p.y + (e.clientY - s.py) / rect.height, 0, 1 - s.p.height),
    });
  }

  function resize(e: React.PointerEvent) {
    e.stopPropagation(); // sinon le conteneur interprète aussi le mouvement comme un déplacement
    const s = start.current, rect = containerRef.current?.getBoundingClientRect();
    if (!s || !rect) return;
    const heightPerWidth = rect.width / rect.height / ratio;
    const maxW = Math.min(1 - s.p.x, (1 - s.p.y) / heightPerWidth);
    const width = clamp(s.p.width + (e.clientX - s.px) / rect.width, MIN_WIDTH, maxW);
    onChange({ ...s.p, width, height: width * heightPerWidth });
  }

  const end = () => { start.current = null; };

  return (
    <div
      role="group"
      aria-label={`Signature, page ${placement.page}`}
      className="absolute cursor-move touch-none border-2 border-dashed border-primary bg-primary/5"
      style={{ left: `${placement.x * 100}%`, top: `${placement.y * 100}%`, width: `${placement.width * 100}%`, height: `${placement.height * 100}%` }}
      onPointerDown={begin}
      onPointerMove={drag}
      onPointerUp={end}
      onPointerCancel={end}
      onClick={(e) => e.stopPropagation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="" draggable={false} className="pointer-events-none h-full w-full select-none object-contain" />
      <button type="button" aria-label="Supprimer cette signature" onPointerDown={(e) => e.stopPropagation()} onClick={onRemove}
        className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow">
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span aria-hidden onPointerDown={begin} onPointerMove={resize} onPointerUp={end} onPointerCancel={end}
        className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-primary" />
    </div>
  );
}

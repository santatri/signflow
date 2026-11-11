const UNITS = ["o", "Ko", "Mo", "Go"] as const;

/** Formate une taille en octets (ex. 1536 -> "1,5 Ko"). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 ? String(Math.round(value)) : value.toFixed(1).replace(".", ",");
  return `${rounded} ${UNITS[unit]}`;
}

/** Nettoie un nom de fichier pour l'affichage et les clés de stockage. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "document";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 100);
  return cleaned || "document";
}

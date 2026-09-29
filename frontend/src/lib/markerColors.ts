/**
 * markerColors.ts — Category colors and SVG helpers with NO Leaflet dependency.
 *
 * Safe to import from any component including those that render server-side.
 * Colors mirror the CSS custom properties in globals.css :root exactly.
 *
 * Leaflet DivIcon factories are in markers.ts (Leaflet-only, used inside
 * components loaded with dynamic(..., { ssr: false })).
 */

import type { KategoriSlug } from "../types";

// ─── Category color palette ────────────────────────────────────────────────
// Must match globals.css :root CSS variables exactly.
export const CATEGORY_COLORS: Record<KategoriSlug, string> = {
  pertanian: "#22C55E",   // --cat-pertanian
  umkm: "#F59E0B",        // --cat-umkm
  wisata: "#3B82F6",      // --cat-wisata
  infrastruktur: "#F43F5E", // --cat-infrastruktur
  "batas-wilayah": "#1D6A47", // --color-primary
};

export const CATEGORY_LABELS: Record<KategoriSlug, string> = {
  pertanian: "Pertanian",
  umkm: "UMKM",
  wisata: "Wisata",
  infrastruktur: "Infrastruktur",
  "batas-wilayah": "Batas Wilayah",
};

// ─── Mini pin SVG (for LayerToggle sidebar legend) ────────────────────────
/**
 * Returns an inline SVG string for the mini teardrop pin shown in the
 * LayerToggle legend. This is a pure string — no Leaflet required.
 */
export function miniPinSvg(kategori: KategoriSlug): string {
  const color = CATEGORY_COLORS[kategori] ?? "#64748B";
  return `<svg width="12" height="16" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg"><path d="M18 0C9.163 0 2 7.163 2 16 c0 10.5 16 30 16 30 s16-19.5 16-30 C34 7.163 26.837 0 18 0z" fill="${color}"/><circle cx="18" cy="16" r="7" fill="white" opacity="0.9"/></svg>`;
}

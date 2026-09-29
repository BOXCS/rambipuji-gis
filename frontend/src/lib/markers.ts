/**
 * markers.ts — Pure category colors and SVG helpers for map pin markers.
 *
 * ⚠️  NO Leaflet import here — this file must be safe to import on the server
 * during Next.js static generation. Leaflet accesses `window` on import and
 * will throw "ReferenceError: window is not defined" if bundled into an SSR
 * module (e.g. through LayerToggle → peta/page).
 *
 * Leaflet DivIcon factories (createPinIcon, createDotIcon) live in
 * MapContainerInner.tsx which is loaded exclusively via:
 *   dynamic(() => import('./MapContainerInner'), { ssr: false })
 * and are therefore never evaluated during server-side rendering.
 */

import type { KategoriSlug } from "../types";

// ─── Category color palette ────────────────────────────────────────────────
// Hard-coded from globals.css :root CSS variables — must stay in sync.
export const CATEGORY_COLORS: Record<KategoriSlug, string> = {
  pertanian: "#22C55E",     // --cat-pertanian
  umkm: "#F59E0B",          // --cat-umkm
  wisata: "#3B82F6",        // --cat-wisata
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

// ─── Pin SVG HTML (wrapper + SVG, no Leaflet) ─────────────────────────────

/**
 * Returns the full HTML string for a teardrop pin DivIcon.
 * Used by createPinIcon() inside MapContainerInner.tsx.
 *
 * @param color  Hex fill color for the pin body
 * @param w      Icon width in px
 * @param h      Icon height in px
 */
export function getPinSVG(color: string, w = 28, h = 38): string {
  return `<div class="map-pin-wrapper" style="display:block;width:${w}px;height:${h}px;transition:transform 0.15s ease;transform-origin:bottom center;cursor:pointer;"><svg width="${w}" height="${h}" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="46" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/><path d="M18 0C9.163 0 2 7.163 2 16 c0 10.5 16 30 16 30 s16-19.5 16-30 C34 7.163 26.837 0 18 0z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="18" cy="16" r="7" fill="white" opacity="0.9"/></svg></div>`;
}

/**
 * Returns the HTML string for a small circular dot marker.
 * Used by createDotIcon() inside MapContainerInner.tsx.
 */
export function getDotSVG(color: string): string {
  return `<div style="width:14px;height:14px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;"></div>`;
}

// ─── Mini pin SVG (for LayerToggle sidebar legend) ────────────────────────

/**
 * Returns a compact inline SVG string for the layer legend icon.
 * This is a plain string — no Leaflet or browser API required.
 */
export function miniPinSvg(kategori: KategoriSlug): string {
  const color = CATEGORY_COLORS[kategori] ?? "#64748B";
  return `<svg width="12" height="16" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg"><path d="M18 0C9.163 0 2 7.163 2 16 c0 10.5 16 30 16 30 s16-19.5 16-30 C34 7.163 26.837 0 18 0z" fill="${color}"/><circle cx="18" cy="16" r="7" fill="white" opacity="0.9"/></svg>`;
}

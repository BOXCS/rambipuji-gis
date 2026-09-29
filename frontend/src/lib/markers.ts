/**
 * markers.ts — Custom Leaflet DivIcon factory for potensi map pins.
 *
 * Creates Google Maps-style teardrop pin SVG icons for each potensi
 * category. Colors are hard-coded from the globals.css CSS variables
 * so they stay in sync with the design token values.
 *
 * Usage:
 *   import { createPinIcon } from "@/lib/markers"
 *   L.marker(latlng, { icon: createPinIcon("umkm") })
 */

import L from "leaflet";
import type { KategoriSlug } from "../types";

// ─── Category color palette ────────────────────────────────────────────────
// Must match globals.css :root CSS variables exactly.
// --cat-pertanian, --cat-umkm, --cat-wisata, --cat-infrastruktur
export const CATEGORY_COLORS: Record<KategoriSlug, string> = {
  pertanian: "#22C55E",
  umkm: "#F59E0B",
  wisata: "#3B82F6",
  infrastruktur: "#F43F5E",
  "batas-wilayah": "#1D6A47",
};

export const CATEGORY_LABELS: Record<KategoriSlug, string> = {
  pertanian: "Pertanian",
  umkm: "UMKM",
  wisata: "Wisata",
  infrastruktur: "Infrastruktur",
  "batas-wilayah": "Batas Wilayah",
};

// ─── Teardrop pin SVG ─────────────────────────────────────────────────────

/** Build the raw SVG string for a teardrop pin. */
function buildPinSvg(color: string, w: number, h: number): string {
  return `
    <svg
      width="${w}"
      height="${h}"
      viewBox="0 0 36 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Drop shadow ellipse -->
      <ellipse
        cx="18" cy="46"
        rx="6" ry="2"
        fill="rgba(0,0,0,0.2)"
      />
      <!-- Teardrop body: circle on top tapering to a point at bottom -->
      <path
        d="M18 0C9.163 0 2 7.163 2 16
           c0 10.5 16 30 16 30
           s16-19.5 16-30
           C34 7.163 26.837 0 18 0z"
        fill="${color}"
        stroke="white"
        stroke-width="1.5"
      />
      <!-- Inner white circle (centre of pin head) -->
      <circle
        cx="18" cy="16"
        r="7"
        fill="white"
        opacity="0.9"
      />
    </svg>
  `;
}

// ─── Pin icon ─────────────────────────────────────────────────────────────

/**
 * Creates a Google Maps-style teardrop pin DivIcon for a given kategori.
 *
 * @param kategori  Potensi category slug used to select the colour
 * @param size      "normal" (28×38px, default) or "large" (36×48px)
 *
 * The icon is anchored at its bottom tip so it points exactly at the
 * feature's coordinate, and the popup opens above the tip.
 */
export function createPinIcon(
  kategori: KategoriSlug,
  size: "normal" | "large" = "normal"
): L.DivIcon {
  const color = CATEGORY_COLORS[kategori] ?? "#64748B";
  const w = size === "large" ? 36 : 28;
  const h = size === "large" ? 48 : 38;

  const svg = buildPinSvg(color, w, h);

  return L.divIcon({
    className: "", // suppress Leaflet's default .leaflet-div-icon styling
    html: `
      <div
        class="map-pin-wrapper"
        style="
          display: block;
          width: ${w}px;
          height: ${h}px;
          transition: transform 0.15s ease;
          transform-origin: bottom center;
          cursor: pointer;
        "
      >
        ${svg}
      </div>
    `,
    iconSize: [w, h],
    iconAnchor: [w / 2, h], // anchor at bottom tip so pin points at coordinate
    popupAnchor: [0, -h],
  });
}

// ─── Dot icon (compact / zoomed-out state) ────────────────────────────────

/**
 * Creates a small circular dot marker — useful for very dense clusters
 * or as a fallback when zoomed far out.
 */
export function createDotIcon(kategori: KategoriSlug): L.DivIcon {
  const color = CATEGORY_COLORS[kategori] ?? "#64748B";
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

// ─── Mini pin SVG (for LayerToggle sidebar) ───────────────────────────────

/**
 * Returns an inline SVG string for the mini teardrop pin shown in the
 * LayerToggle sidebar legend. No Leaflet dependency needed here.
 */
export function miniPinSvg(kategori: KategoriSlug): string {
  const color = CATEGORY_COLORS[kategori] ?? "#64748B";
  return `
    <svg
      width="12" height="16"
      viewBox="0 0 36 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 0C9.163 0 2 7.163 2 16
           c0 10.5 16 30 16 30
           s16-19.5 16-30
           C34 7.163 26.837 0 18 0z"
        fill="${color}"
      />
      <circle cx="18" cy="16" r="7" fill="white" opacity="0.9"/>
    </svg>
  `;
}

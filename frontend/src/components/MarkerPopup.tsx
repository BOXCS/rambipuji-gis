/**
 * MarkerPopup — Google Maps-style info window that appears above a map marker.
 *
 * Layout: white card (w-72, rounded-2xl, shadow-xl) with downward-pointing
 * arrow that tracks the marker's screen position. Viewport-clamped so it
 * never overflows the edge of the browser window.
 */

import { Mountain, Navigation, Phone, X } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import React from "react";
import type { PotensiFeature } from "../types";
import CategoryBadge from "./CategoryBadge";

export interface MarkerPopupProps {
  feature: PotensiFeature;
  position?: { x: number; y: number } | null;
  onClose: () => void;
}

function getCenterLatLng(geometry: PotensiFeature["geometry"]): [number, number] {
  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates;
    return [lat, lng];
  }

  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates[0] || [];
    if (ring.length === 0) return [-8.25, 113.6];
    let sumLat = 0;
    let sumLng = 0;
    for (const coord of ring) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
    return [sumLat / ring.length, sumLng / ring.length];
  }

  if (geometry.type === "MultiPolygon") {
    const poly = geometry.coordinates[0] || [];
    const ring = poly[0] || [];
    if (ring.length === 0) return [-8.25, 113.6];
    let sumLat = 0;
    let sumLng = 0;
    for (const coord of ring) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
    return [sumLat / ring.length, sumLng / ring.length];
  }

  return [-8.25, 113.6];
}

// Category-specific gradient backgrounds for the no-photo state
const CATEGORY_GRADIENTS: Record<string, string> = {
  pertanian: "linear-gradient(135deg, var(--cat-pertanian-subtle), #d1fae5)",
  umkm: "linear-gradient(135deg, var(--cat-umkm-subtle), #fef3c7)",
  wisata: "linear-gradient(135deg, var(--cat-wisata-subtle), #dbeafe)",
  infrastruktur: "linear-gradient(135deg, var(--cat-infrastruktur-subtle), #fee2e2)",
  "batas-wilayah": "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  pertanian: "var(--cat-pertanian)",
  umkm: "var(--cat-umkm)",
  wisata: "var(--cat-wisata)",
  infrastruktur: "var(--cat-infrastruktur)",
  "batas-wilayah": "var(--color-neutral)",
};

export default function MarkerPopup({
  feature,
  position,
  onClose,
}: MarkerPopupProps) {
  const { nama, nama_usaha, foto, kontak } = feature.properties || {};
  const kategori = feature.properties?.kategori ?? null;
  const id = feature.id ?? feature.properties?.id ?? null;
  const title = nama || nama_usaha || "Tanpa Nama";
  const [lat, lng] = getCenterLatLng(feature.geometry);
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const detailHref = kategori && id ? `/potensi/${kategori}/${id}` : null;

  // ── Positioning constants ────────────────────────────────────────────────
  const POPUP_WIDTH = 288;
  const POPUP_HEIGHT = 220; // approximate rendered height
  const ARROW_HEIGHT = 10;
  const PIN_HEIGHT = 38;    // height of the teardrop pin icon (normal size)
  const OFFSET_Y = 4;       // small gap between popup arrow and pin tip

  const windowWidth =
    typeof window !== "undefined" ? window.innerWidth : 1200;

  const rawLeft = position ? position.x - POPUP_WIDTH / 2 : 0;
  const rawTop = position
    ? position.y - POPUP_HEIGHT - ARROW_HEIGHT - PIN_HEIGHT - OFFSET_Y
    : 0;

  const clampedLeft = position
    ? Math.max(8, Math.min(rawLeft, windowWidth - POPUP_WIDTH - 8))
    : 0;
  const clampedTop = position ? Math.max(8, rawTop) : 0;

  // Arrow offset relative to the popup card left edge — tracks the real marker
  const arrowLeft = position ? position.x - clampedLeft : POPUP_WIDTH / 2;
  const arrowClamped = Math.max(20, Math.min(arrowLeft, POPUP_WIDTH - 20));

  const positionStyle: React.CSSProperties = position
    ? {
        position: "absolute",
        left: `${clampedLeft}px`,
        top: `${clampedTop}px`,
        width: `${POPUP_WIDTH}px`,
        zIndex: 1000,
      }
    : {};

  const photoGradient =
    CATEGORY_GRADIENTS[kategori ?? ""] ?? CATEGORY_GRADIENTS["batas-wilayah"];
  const iconColor =
    CATEGORY_ICON_COLORS[kategori ?? ""] ??
    CATEGORY_ICON_COLORS["batas-wilayah"];

  return (
    <div
      style={position ? positionStyle : undefined}
      className={`z-40 animate-in fade-in duration-150 ${
        position
          ? ""
          : "absolute bottom-4 left-4 right-4 md:right-auto md:w-72"
      }`}
    >
      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-72">

        {/* Photo area */}
        <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden">
          {foto ? (
            <NextImage
              src={foto}
              alt={title}
              fill
              sizes="288px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: photoGradient }}
            >
              <Mountain
                className="w-8 h-8 opacity-50"
                style={{ color: iconColor }}
              />
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="px-3 py-2.5">
          {/* Header row: badge + close */}
          <div className="flex items-start justify-between">
            {kategori ? (
              <CategoryBadge kategori={kategori} size="sm" />
            ) : (
              <span className="text-xs font-semibold text-[--text-secondary]">
                Potensi
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-0.5 -mr-0.5 text-[--text-muted] hover:text-[--text-primary] transition-colors rounded"
              aria-label="Tutup popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-sm text-[--text-primary] mt-1.5 line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Kontak row (if available) */}
          {kontak && (
            <div className="flex items-center gap-1 mt-1">
              <Phone className="h-3 w-3 text-[--text-muted] flex-shrink-0" />
              <span className="text-xs text-[--text-muted] line-clamp-1">
                {kontak}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-2.5 pb-0.5">
            {detailHref ? (
              <Link
                href={detailHref}
                className="flex-1 flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-subtle] transition-colors duration-150"
              >
                Lihat Detail
              </Link>
            ) : (
              <span className="flex-1 flex items-center justify-center px-3 py-1.5 text-xs text-[--text-muted] rounded-lg border border-[--border-default]">
                Detail tidak tersedia
              </span>
            )}

            <a
              href={gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[--color-primary] hover:bg-[--color-primary-hover] text-white text-xs font-medium rounded-lg transition-colors duration-150"
            >
              <Navigation className="w-3.5 h-3.5" />
              Rute
            </a>
          </div>
        </div>
      </div>

      {/* ── Arrow pointing down to marker ─────────────────────────────────── */}
      {position && (
        <div
          style={{
            position: "absolute",
            bottom: -ARROW_HEIGHT,
            left: arrowClamped,
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: `${ARROW_HEIGHT}px solid white`,
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.1))",
          }}
        />
      )}
    </div>
  );
}

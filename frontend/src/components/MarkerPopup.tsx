import { Mountain, Navigation, X } from "lucide-react";
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
    if (ring.length === 0) {
      return [-8.25, 113.6];
    }
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
    if (ring.length === 0) {
      return [-8.25, 113.6];
    }
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

export default function MarkerPopup({
  feature,
  position,
  onClose,
}: MarkerPopupProps) {
  console.log("MarkerPopup feature:", feature.properties);
  const { nama, nama_usaha, foto, deskripsi } = feature.properties || {};
  const kategori = feature.properties?.kategori ?? null;
  const id = feature.id ?? feature.properties?.id ?? null;
  const title = nama || nama_usaha || "Tanpa Nama";
  const [lat, lng] = getCenterLatLng(feature.geometry);
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const detailHref = kategori && id ? `/potensi/${kategori}/${id}` : null;

  const POPUP_WIDTH = 288;
  const POPUP_HEIGHT = 300;
  const ARROW_HEIGHT = 12;
  const OFFSET_Y = 36;

  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

  const rawLeft = position ? position.x - POPUP_WIDTH / 2 : 0;
  const rawTop = position
    ? position.y - POPUP_HEIGHT - ARROW_HEIGHT - OFFSET_Y
    : 0;

  const clampedLeft = position
    ? Math.max(8, Math.min(rawLeft, windowWidth - POPUP_WIDTH - 8))
    : 0;
  const clampedTop = position ? Math.max(8, rawTop) : 0;

  const positionStyle: React.CSSProperties = position
    ? {
      position: "absolute",
      left: `${clampedLeft}px`,
      top: `${clampedTop}px`,
      width: `${POPUP_WIDTH}px`,
      zIndex: 1000,
      transition: "opacity 0.15s ease, transform 0.15s ease",
    }
    : {};

  const arrowLeft = position ? position.x - clampedLeft : POPUP_WIDTH / 2;
  const arrowClamped = Math.max(20, Math.min(arrowLeft, POPUP_WIDTH - 20));

  return (
    <div
      style={position ? positionStyle : undefined}
      className={`z-40 ${
        position
          ? "animate-in fade-in duration-200"
          : "absolute bottom-4 left-4 right-4 md:right-auto md:w-72"
      }`}
    >
      <div className="bg-white rounded-2xl border border-[--border-default] shadow-xl overflow-hidden flex flex-col w-72">
        {/* Photo area */}
        <div className="relative w-full aspect-video bg-[--color-primary-subtle]">
          {foto ? (
            <img
              src={foto}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[--color-primary] opacity-40">
              <Mountain className="w-10 h-10" />
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white text-[--text-primary] rounded-full transition shadow-sm"
            aria-label="Tutup popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div className="p-4">
          {/* Header row: badge */}
          {kategori ? (
            <CategoryBadge kategori={kategori} size="sm" />
          ) : (
            <span className="text-xs font-semibold text-[--text-secondary]">
              Potensi
            </span>
          )}

          {/* Name */}
          <h3 className="font-semibold text-base text-[--text-primary] mt-2 line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[--text-secondary] mt-1 line-clamp-3">
            {deskripsi || "Informasi potensi desa di kawasan Rambipuji."}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
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

      {/* Arrow pointing down to marker */}
      {position && (
        <div
          style={{
            position: "absolute",
            bottom: `-${ARROW_HEIGHT}px`,
            left: `${arrowClamped}px`,
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: `${ARROW_HEIGHT}px solid white`,
          }}
        />
      )}
    </div>
  );
}

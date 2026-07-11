import { MapPin, Navigation, X } from "lucide-react";
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

  const POPUP_WIDTH = 280;
  const POPUP_HEIGHT = 280;
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
      className={`z-40 ${position
        ? "animate-in fade-in duration-200"
        : "absolute bottom-4 left-4 right-4 md:right-auto md:w-80"
        }`}
    >
      <div className="bg-white rounded-xl border border-[--border-default] shadow-floating overflow-hidden flex flex-col">
        <div className="relative w-full h-36 bg-[--color-neutral-subtle]">
          {foto ? (
            <img
              src={foto}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[--text-muted] text-xs">
              Foto tidak tersedia
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
            aria-label="Tutup popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            {kategori ? (
              <CategoryBadge kategori={kategori} />
            ) : (
              <span className="text-xs font-semibold text-[--text-secondary]">
                Potensi
              </span>
            )}
            <span className="inline-flex items-center text-xs text-[--text-secondary]">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[--color-primary]" />
              Rambipuji
            </span>
          </div>

          <h3 className="text-base font-semibold text-[--text-primary] line-clamp-1">
            {title}
          </h3>

          <p className="text-xs text-[--text-secondary] line-clamp-3">
            {deskripsi || "Informasi potensi desa di kawasan Rambipuji."}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-[--border-default] gap-2">
            {detailHref ? (
              <Link
                href={detailHref}
                className="text-xs font-semibold text-[--color-primary] hover:underline"
              >
                Lihat Detail →
              </Link>
            ) : (
              <span className="text-xs text-[--text-muted]">
                Detail tidak tersedia
              </span>
            )}

            <a
              href={gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2.5 py-1.5 bg-[--color-primary] hover:bg-[--color-primary-hover] text-white text-xs font-medium rounded-lg transition"
            >
              <Navigation className="w-3.5 h-3.5 mr-1" />
              Rute
            </a>
          </div>
        </div>
      </div>
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

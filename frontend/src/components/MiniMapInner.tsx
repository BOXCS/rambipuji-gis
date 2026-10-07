"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { PotensiFeature } from "../types";

export interface MiniMapInnerProps {
  feature?: PotensiFeature | null;
  boundaryFeature?: PotensiFeature | null;
}

function getCenterLatLng(geometry?: PotensiFeature["geometry"] | null): [number, number] {
  if (!geometry) return [-8.2562, 113.6148];

  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates;
    return [lat, lng] as [number, number];
  }

  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates[0] || [];
    if (ring.length === 0) return [-8.2562, 113.6148];
    let sumLat = 0;
    let sumLng = 0;
    for (const coord of ring) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
    return [sumLat / ring.length, sumLng / ring.length] as [number, number];
  }

  if (geometry.type === "MultiPolygon") {
    const poly = geometry.coordinates[0] || [];
    const ring = poly[0] || [];
    if (ring.length === 0) return [-8.2562, 113.6148];
    let sumLat = 0;
    let sumLng = 0;
    for (const coord of ring) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
    return [sumLat / ring.length, sumLng / ring.length] as [number, number];
  }

  return [-8.2562, 113.6148];
}

export default function MiniMapInner({ feature, boundaryFeature }: MiniMapInnerProps) {
  useEffect(() => {
    delete (
      L.Icon.Default.prototype as unknown as Record<string, unknown>
    )._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const pointLocation: [number, number] = feature ? getCenterLatLng(feature.geometry) : [-8.2562, 113.6148];
  const pointTitle = feature?.properties?.nama || feature?.properties?.nama_usaha || "Balai Desa Rambipuji";

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-[--border-default] relative">
      <MapContainer
        center={pointLocation}
        zoom={16}
        dragging={true}
        zoomControl={true}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Boundary overlay if present */}
        {boundaryFeature && (
          <GeoJSON
            data={boundaryFeature as GeoJSON.Feature}
            style={() => ({
              color: "var(--color-primary)",
              weight: 1.5,
              fillOpacity: 0.08,
              dashArray: "4,4",
            })}
          />
        )}

        {/* Balai Desa Rambipuji point marker */}
        <Marker position={pointLocation}>
          <Popup>
            <div className="font-semibold text-xs text-[--text-primary]">
              {pointTitle}
            </div>
            <div className="text-[10px] text-[--text-muted]">
              Fasilitas &amp; Infrastruktur Desa Rambipuji
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import { GeoJSON, MapContainer, Marker, TileLayer } from "react-leaflet";
import type { PotensiFeature } from "../types";

export interface MiniMapInnerProps {
  feature: PotensiFeature;
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

export default function MiniMapInner({ feature }: MiniMapInnerProps) {
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

  const center = getCenterLatLng(feature.geometry);
  const isPoint = feature.geometry.type === "Point";

  return (
    <div className="w-full h-48 rounded-xl overflow-hidden border border-[--border-default]">
      <MapContainer
        center={center}
        zoom={15}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {isPoint ? (
          <Marker position={center} />
        ) : (
          <GeoJSON
            data={feature as GeoJSON.Feature}
            style={() => ({
              color: "var(--color-primary)",
              weight: 2,
              fillOpacity: 0.2,
            })}
          />
        )}
      </MapContainer>
    </div>
  );
}

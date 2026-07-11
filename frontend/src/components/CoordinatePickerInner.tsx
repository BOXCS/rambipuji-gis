"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

export interface CoordinatePickerInnerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

function ClickHandler({
  onChange,
}: {
  onChange: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function CoordinatePickerInner({
  value,
  onChange,
}: CoordinatePickerInnerProps) {
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

  const center: [number, number] = value
    ? [value.lat, value.lng]
    : [-8.25, 113.6];

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-[--border-default] bg-[--bg-surface-raised]">
      {!value && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/75 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-full shadow-md pointer-events-none">
          Klik pada peta untuk menentukan lokasi
        </div>
      )}

      <MapContainer
        center={center}
        zoom={14}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onChange={onChange} />

        {value && (
          <Marker
            position={[value.lat, value.lng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target as L.Marker;
                const latlng = marker.getLatLng();
                onChange({ lat: latlng.lat, lng: latlng.lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

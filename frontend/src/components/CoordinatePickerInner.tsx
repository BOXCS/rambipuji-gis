"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export interface CoordinatePickerInnerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

// ─── Map setup helper ───────────────────────────────────────────────────────

/** Stores the Leaflet map instance in the provided ref so we can call setView() from outside. */
function MapInstanceCapture({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

// ─── Click handler ───────────────────────────────────────────────────────────

function ClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function CoordinatePickerInner({
  value,
  onChange,
}: CoordinatePickerInnerProps) {
  const mapRef = useRef<L.Map | null>(null);

  const [latInput, setLatInput] = useState<string>(
    value?.lat != null ? value.lat.toFixed(6) : ""
  );
  const [lngInput, setLngInput] = useState<string>(
    value?.lng != null ? value.lng.toFixed(6) : ""
  );

  // Fix Leaflet default icon paths (prevents 404 on marker images)
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

  // Sync text inputs when value prop changes externally (e.g. edit page load)
  useEffect(() => {
    if (value) {
      setLatInput(value.lat.toFixed(6));
      setLngInput(value.lng.toFixed(6));
    }
  }, [value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // Called by both map clicks and dragend
  const handleMapClick = (lat: number, lng: number) => {
    setLatInput(lat.toFixed(6));
    setLngInput(lng.toFixed(6));
    onChange({ lat, lng });
  };

  const handleLatChange = (raw: string) => {
    setLatInput(raw);
    const lat = parseFloat(raw);
    const lng = parseFloat(lngInput);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      const safeLng = isNaN(lng) ? 0 : lng;
      onChange({ lat, lng: safeLng });
      mapRef.current?.setView([lat, isNaN(lng) ? 0 : lng], 15);
    }
  };

  const handleLngChange = (raw: string) => {
    setLngInput(raw);
    const lat = parseFloat(latInput);
    const lng = parseFloat(raw);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      const safeLat = isNaN(lat) ? 0 : lat;
      onChange({ lat: safeLat, lng });
      mapRef.current?.setView([isNaN(lat) ? 0 : lat, lng], 15);
    }
  };

  const center: [number, number] = value
    ? [value.lat, value.lng]
    : [-8.25, 113.6];

  const inputClass =
    "w-full border border-[--border-default] rounded-lg px-3 py-2 text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary]";

  return (
    <div>
      {/* Map area */}
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

          <MapInstanceCapture mapRef={mapRef} />
          <ClickHandler onMapClick={handleMapClick} />

          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target as L.Marker;
                  const latlng = marker.getLatLng();
                  handleMapClick(latlng.lat, latlng.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Manual lat/lng inputs */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[--text-secondary] mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            placeholder="-8.250000"
            value={latInput}
            onChange={(e) => handleLatChange(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[--text-secondary] mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            placeholder="113.600000"
            value={lngInput}
            onChange={(e) => handleLngChange(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Validation hint */}
      <p className="text-xs text-[--text-muted] mt-1.5">
        Koordinat untuk wilayah Jember sekitar: Lat -8.1 s/d -8.5 · Lng 113.4 s/d 113.9
      </p>
    </div>
  );
}

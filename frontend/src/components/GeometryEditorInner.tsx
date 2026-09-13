"use client";

import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { KategoriSlug } from "../types";

interface Props {
  kategori: KategoriSlug;
  value: GeoJSON.Geometry | null;
  onChange: (geom: GeoJSON.Geometry | null) => void;
  mode: "point" | "polygon" | "both";
}

// ─── Polygon summary (shown only in polygon mode) ────────────────────────────

function PolygonSummary({ geom }: { geom: GeoJSON.Geometry | null }) {
  if (!geom) return null;

  if (geom.type === "Polygon") {
    const ring = (geom.coordinates as number[][][])[0] || [];
    const n = Math.max(0, ring.length - 1);
    return (
      <p className="text-xs text-[--text-secondary] font-mono mt-2 px-1">
        Area: {n} titik koordinat
      </p>
    );
  }

  if (geom.type !== "Point") {
    return (
      <p className="text-xs text-[--text-secondary] mt-2 px-1">
        Geometri tersimpan ({geom.type})
      </p>
    );
  }

  return null;
}

// ─── Child: stores the Leaflet map instance in a ref ─────────────────────────

function MapReadyDetector({
  onReady,
}: {
  onReady: (map: L.Map) => void;
}) {
  const map = useMap();
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (map) {
      const timer = setTimeout(() => onReadyRef.current(map), 50);
      return () => clearTimeout(timer);
    }
  }, [map]);

  return null;
}

// ─── Child: click handler for point mode ─────────────────────────────────────

function PointClickHandler({
  enabled,
  onPointClick,
}: {
  enabled: boolean;
  onPointClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onPointClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GeometryEditorInner({
  kategori: _kategori,
  value,
  onChange,
  mode,
}: Props) {
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const existingGeomRef = useRef(value);
  existingGeomRef.current = value;

  // ── Point-mode manual input state ──
  const isPoint = mode === "point";

  const pointCoords: [number, number] | null =
    isPoint && value && value.type === "Point"
      ? [
          (value.coordinates as [number, number])[1],
          (value.coordinates as [number, number])[0],
        ]
      : null;

  const [latInput, setLatInput] = useState<string>(
    pointCoords ? pointCoords[0].toFixed(6) : ""
  );
  const [lngInput, setLngInput] = useState<string>(
    pointCoords ? pointCoords[1].toFixed(6) : ""
  );

  // Sync inputs when value changes (e.g. edit page load)
  useEffect(() => {
    if (isPoint && value && value.type === "Point") {
      const [lng, lat] = value.coordinates as [number, number];
      setLatInput(lat.toFixed(6));
      setLngInput(lng.toFixed(6));
    }
  }, [isPoint, value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Shared handler: called by both map click and input change
  const handlePointSet = (lat: number, lng: number) => {
    setLatInput(lat.toFixed(6));
    setLngInput(lng.toFixed(6));
    onChangeRef.current({
      type: "Point",
      coordinates: [lng, lat],
    });
  };

  const handleLatInputChange = (raw: string) => {
    setLatInput(raw);
    const lat = parseFloat(raw);
    const lng = parseFloat(lngInput);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      const safeLng = isNaN(lng) ? 0 : lng;
      onChangeRef.current({ type: "Point", coordinates: [safeLng, lat] });
      leafletMap?.setView([lat, safeLng], 15);
    }
  };

  const handleLngInputChange = (raw: string) => {
    setLngInput(raw);
    const lat = parseFloat(latInput);
    const lng = parseFloat(raw);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      const safeLat = isNaN(lat) ? 0 : lat;
      onChangeRef.current({ type: "Point", coordinates: [lng, safeLat] });
      leafletMap?.setView([safeLat, lng], 15);
    }
  };

  // Ensure Leaflet default icons always point to unpkg CDN (preventing 404 image icons)
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
      ._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // ── Geoman polygon tooling ──
  useEffect(() => {
    if (!leafletMap) return;

    let mounted = true;

    const initGeoman = async () => {
      // Ensure CSS loaded first
      const linkId = "geoman-css";
      if (!document.getElementById(linkId)) {
        await new Promise<void>((resolve) => {
          const link = document.createElement("link");
          link.id = linkId;
          link.rel = "stylesheet";
          link.href =
            "https://unpkg.com/@geoman-io/leaflet-geoman-free@latest/dist/leaflet-geoman.css";
          link.onload = () => resolve();
          link.onerror = () => resolve();
          document.head.appendChild(link);
        });
      }

      const leafletModule = await import("leaflet");
      const LMod = leafletModule.default ?? leafletModule;

      // Fix Leaflet default marker icon paths
      delete (LMod.Icon.Default.prototype as unknown as Record<string, unknown>)
        ._getIconUrl;
      LMod.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // @ts-ignore -- Leaflet geoman free dynamic import without types
      await import("@geoman-io/leaflet-geoman-free");

      if (!mounted) return;

      const pmMap = leafletMap as unknown as {
        pm?: {
          addControls: (options: Record<string, unknown>) => void;
          removeControls: () => void;
        };
      };

      const LAny = LMod as unknown as {
        PM?: {
          Map?: new (m: L.Map) => unknown;
          reInitLayer?: (m: L.Map) => void;
        };
      };
      if (!pmMap.pm && LAny.PM) {
        if (typeof LAny.PM.reInitLayer === "function") {
          LAny.PM.reInitLayer(leafletMap);
        }
        if (!pmMap.pm && typeof LAny.PM.Map === "function") {
          (leafletMap as unknown as Record<string, unknown>).pm =
            new LAny.PM.Map(leafletMap);
        }
      }

      if (!pmMap.pm) {
        console.error("Geoman (pm) not available on map");
        return;
      }

      // Clean up any old Geoman layers when mode switches
      leafletMap.eachLayer((layer: unknown) => {
        const l = layer as { pm?: unknown };
        if (l.pm) {
          leafletMap.removeLayer(l as never);
        }
      });

      if (mode === "point") {
        // In point mode, we don't need Geoman toolbar controls — user just clicks the map
        pmMap.pm.removeControls();
      } else {
        // In polygon mode, enable Geoman controls for drawing & editing polygons
        pmMap.pm.addControls({
          position: "topleft",
          drawMarker: false,
          drawCircleMarker: false,
          drawPolyline: false,
          drawRectangle: false,
          drawPolygon: true,
          drawCircle: false,
          drawText: false,
          editMode: true,
          dragMode: true,
          cutPolygon: false,
          removalMode: true,
          rotateMode: false,
        });

        // Load existing polygon geometry into Geoman
        if (existingGeomRef.current && existingGeomRef.current.type !== "Point") {
          try {
            const layer = LMod.geoJSON({
              type: "Feature",
              geometry: existingGeomRef.current,
              properties: {},
            } as GeoJSON.Feature);
            layer.addTo(leafletMap);
            try {
              const bounds = layer.getBounds();
              if (bounds.isValid()) {
                leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
              }
            } catch {
              const center = layer.getBounds().getCenter();
              leafletMap.setView(center, 15);
            }
          } catch (err) {
            console.warn("Could not load/fit polygon geometry:", err);
          }
        }
      }

      leafletMap.off("pm:create");
      leafletMap.off("pm:edit");
      leafletMap.off("pm:remove");

      if (mode !== "point") {
        leafletMap.on("pm:create", (e: unknown) => {
          const ev = e as {
            layer: { pm?: unknown; toGeoJSON?: () => unknown };
          };
          leafletMap.eachLayer((layer: unknown) => {
            const l = layer as { pm?: unknown };
            if (layer !== ev.layer && l.pm) {
              leafletMap.removeLayer(l as never);
            }
          });

          if (typeof ev.layer.toGeoJSON === "function") {
            const geojson = ev.layer.toGeoJSON() as unknown as Record<
              string,
              unknown
            >;
            const geometry = (geojson.geometry ?? geojson) as GeoJSON.Geometry;
            onChangeRef.current(geometry);
          }
        });

        leafletMap.on("pm:edit", (e: unknown) => {
          const ev = e as { layer: { toGeoJSON?: () => unknown } };
          if (typeof ev.layer.toGeoJSON === "function") {
            const geojson = ev.layer.toGeoJSON() as unknown as Record<
              string,
              unknown
            >;
            const geometry = (geojson.geometry ?? geojson) as GeoJSON.Geometry;
            onChangeRef.current(geometry);
          }
        });

        leafletMap.on("pm:remove", () => {
          onChangeRef.current(null);
        });
      }
    };

    initGeoman();

    return () => {
      mounted = false;
      const pmMap = leafletMap as unknown as {
        pm?: { removeControls: () => void };
      };
      if (pmMap.pm) {
        pmMap.pm.removeControls();
      }
      leafletMap.off("pm:create");
      leafletMap.off("pm:edit");
      leafletMap.off("pm:remove");
    };
  }, [leafletMap, mode]);

  const inputClass =
    "w-full border border-[--border-default] rounded-lg px-3 py-2 text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--color-primary]";

  return (
    <div>
      <div
        className="relative rounded-xl overflow-hidden border border-[--border-default]"
        style={{ zIndex: 0 }}
      >
        <MapContainer
          center={[-8.25, 113.6]}
          zoom={13}
          style={{
            height: "500px",
            width: "100%",
            borderRadius: "12px",
            zIndex: 0,
            position: "relative",
            pointerEvents: "auto",
          }}
          className="rounded-xl"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapReadyDetector onReady={setLeafletMap} />

          {/* When in point mode, clicking map places a Point geometry directly */}
          <PointClickHandler
            enabled={isPoint}
            onPointClick={(lat, lng) => handlePointSet(lat, lng)}
          />

          {/* Render clean draggable Marker for Point geometry */}
          {isPoint && pointCoords && (
            <Marker
              position={pointCoords}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target as L.Marker;
                  const latlng = marker.getLatLng();
                  handlePointSet(latlng.lat, latlng.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Instruction text when nothing placed yet */}
      {!value && (
        <p className="text-xs text-[--text-muted] mt-2 text-center">
          {mode === "point"
            ? "Klik langsung pada peta atau ketik koordinat di bawah untuk menentukan lokasi titik spasial"
            : "Klik tombol polygon (⬠) di pojok kiri atas peta, lalu klik titik-titik area di peta. Double-klik untuk menutup area."}
        </p>
      )}

      {/* Point mode: editable lat/lng inputs */}
      {isPoint && (
        <>
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
                onChange={(e) => handleLatInputChange(e.target.value)}
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
                onChange={(e) => handleLngInputChange(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-xs text-[--text-muted] mt-1.5">
            Koordinat untuk wilayah Jember sekitar: Lat -8.1 s/d -8.5 · Lng 113.4 s/d 113.9
          </p>
        </>
      )}

      {/* Polygon mode: summary only */}
      {!isPoint && <PolygonSummary geom={value} />}
    </div>
  );
}

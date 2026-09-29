"use client";

/**
 * MapContainerInner — React-Leaflet map with custom DivIcon pin markers.
 *
 * Loaded exclusively via dynamic(() => import('./MapContainerInner'), { ssr: false })
 * — never evaluated during server-side rendering. This is why Leaflet and the
 * createPinIcon / createDotIcon functions are safe to define here.
 *
 * Layer strategy:
 *  - WMS tiles: batas_wilayah (always), pertanian polygon areas, wisata polygon areas
 *  - GeoJSON pin markers: all POINT features for active categories
 *  - UMKM + Infrastruktur: pin markers only (always Point geometry)
 */

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  WMSTileLayer,
} from "react-leaflet";
import { LAYER_NAMES, getWMSParams, getWMSUrl } from "../lib/geoserver";
import {
  CATEGORY_COLORS,
  getDotSVG,
  getPinSVG,
} from "../lib/markers";
import type { KategoriSlug, PotensiCollection, PotensiFeature } from "../types";

// ─── Leaflet DivIcon factories ───────────────────────────────────────────────
// Defined here (not in markers.ts) because they require `import L from
// "leaflet"` which accesses `window` on import. This file is only ever
// loaded via dynamic(() => import('./MapContainerInner'), { ssr: false }),
// so Leaflet is never evaluated during server-side rendering.

function createPinIcon(
  kategori: KategoriSlug,
  size: "normal" | "large" = "normal"
): L.DivIcon {
  const color = CATEGORY_COLORS[kategori] ?? "#64748B";
  const w = size === "large" ? 36 : 28;
  const h = size === "large" ? 48 : 38;
  return L.divIcon({
    className: "",
    html: getPinSVG(color, w, h),
    iconSize: [w, h],
    iconAnchor: [w / 2, h], // bottom tip points at the coordinate
    popupAnchor: [0, -h],
  });
}

function createDotIcon(kategori: KategoriSlug): L.DivIcon {
  const color = CATEGORY_COLORS[kategori] ?? "#64748B";
  return L.divIcon({
    className: "",
    html: getDotSVG(color),
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

// Silence unused-variable warning — createDotIcon is available for future use
void createDotIcon;


export interface MapContainerInnerProps {
  activeLayers: Set<KategoriSlug>;
  onFeatureClick: (
    feature: PotensiFeature,
    containerPoint?: { x: number; y: number }
  ) => void;
  batasWilayahData?: PotensiCollection;
  potensiData?: PotensiCollection;
}

// CQL filter to show only polygon-type geometries in WMS tiles.
// This prevents double-rendering on point features that also have
// a pin marker drawn from GeoJSON.
const POLYGON_CQL =
  "strGeometryType(geom)='Polygon' OR strGeometryType(geom)='MultiPolygon'";

export default function MapContainerInner({
  activeLayers,
  onFeatureClick,
  batasWilayahData,
  potensiData,
}: MapContainerInnerProps) {
  useEffect(() => {
    // Fix missing Leaflet default icon in Next.js SSR environment
    delete (
      L.Icon.Default.prototype as unknown as Record<string, unknown>
    )._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // ── Derived feature sets ─────────────────────────────────────────────────

  // All features whose category layer is currently toggled on
  const visibleFeatures =
    potensiData?.features.filter((f) =>
      activeLayers.has(f.properties.kategori)
    ) ?? [];

  // Point features → rendered as pin markers
  const POINT_TYPES = new Set(["Point", "MultiPoint"]);
  const pointFeatures = visibleFeatures.filter((f) =>
    POINT_TYPES.has(f.geometry.type)
  );

  // ── Click handler factory ────────────────────────────────────────────────

  function makeClickHandler(feature: PotensiFeature) {
    return (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
      const layer = e.target as L.Marker;
      // Use the marker's own latlng for accurate popup placement
      const map: L.Map | undefined =
        (layer as unknown as { _map?: L.Map })._map;
      const latlng =
        feature.geometry.type === "Point"
          ? L.latLng(
              (feature.geometry.coordinates as [number, number])[1],
              (feature.geometry.coordinates as [number, number])[0]
            )
          : e.latlng;
      const point = map
        ? map.latLngToContainerPoint(latlng)
        : { x: 0, y: 0 };
      onFeatureClick(feature, { x: point.x, y: point.y });
    };
  }

  return (
    <MapContainer
      center={[-8.25, 113.6]}
      zoom={13}
      className="w-full h-full z-0"
    >
      {/* ── Base tile ───────────────────────────────────────────────────── */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ── Batas wilayah WMS — always visible, polygon boundary ────────── */}
      <WMSTileLayer
        key="batas_wilayah_wms"
        url={getWMSUrl()}
        {...getWMSParams(LAYER_NAMES["batas-wilayah"])}
        opacity={0.6}
        zIndex={1}
      />

      {/* Batas wilayah GeoJSON — transparent fill, click-through boundary */}
      {batasWilayahData && (
        <GeoJSON
          key="batas_wilayah_geojson"
          data={batasWilayahData as GeoJSON.FeatureCollection}
          style={() => ({
            color: "#1D6A47",
            weight: 2,
            fillOpacity: 0,
            opacity: 0.6,
          })}
          onEachFeature={(feature, layer) => {
            layer.on("click", (e: L.LeafletMouseEvent) => {
              L.DomEvent.stopPropagation(e);
              const map =
                (layer as unknown as { _map?: L.Map })._map || e.target._map;
              const point = map
                ? map.latLngToContainerPoint(e.latlng)
                : { x: 0, y: 0 };
              onFeatureClick(feature as unknown as PotensiFeature, {
                x: point.x,
                y: point.y,
              });
            });
          }}
        />
      )}

      {/* ── Pertanian WMS — polygon areas only (CQL excludes points) ────── */}
      {activeLayers.has("pertanian") && (
        <WMSTileLayer
          key="pertanian_polygon_wms"
          url={getWMSUrl()}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({...getWMSParams(LAYER_NAMES["pertanian"]), CQL_FILTER: POLYGON_CQL} as any)}
          opacity={0.5}
          zIndex={2}
        />
      )}

      {/* ── Wisata WMS — polygon areas only (CQL excludes points) ───────── */}
      {activeLayers.has("wisata") && (
        <WMSTileLayer
          key="wisata_polygon_wms"
          url={getWMSUrl()}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({...getWMSParams(LAYER_NAMES["wisata"]), CQL_FILTER: POLYGON_CQL} as any)}
          opacity={0.5}
          zIndex={2}
        />
      )}

      {/*
       * ── Pin markers for POINT features ────────────────────────────────
       *
       * Each visible Point feature gets its own <GeoJSON> with a
       * unique key so React re-renders only changed pins when the
       * potensiData changes (e.g. after polling).
       *
       * Using per-feature <GeoJSON> (not one big collection) avoids the
       * need to re-render all pins when a single one changes, and
       * guarantees each pin has the correct kategori colour.
       *
       * UMKM and Infrastruktur are always points, so they are shown
       * exclusively here — no WMS layer is rendered for them.
       */}
      {pointFeatures.map((feature) => {
        const kategori = feature.properties.kategori as KategoriSlug;
        const featureId = feature.id ?? feature.properties?.id ?? Math.random();

        return (
          <GeoJSON
            key={`pin-${kategori}-${featureId}`}
            data={feature as unknown as GeoJSON.Feature}
            pointToLayer={(_feat, latlng) =>
              L.marker(latlng, {
                icon: createPinIcon(kategori),
                // Pins must appear above WMS polygon tiles
                zIndexOffset: 200,
              })
            }
            onEachFeature={(_feat, layer) => {
              layer.on("click", makeClickHandler(feature));
            }}
          />
        );
      })}
    </MapContainer>
  );
}

"use client";

/**
 * MapContainerInner — React-Leaflet map with custom DivIcon pin markers.
 *
 * Loaded exclusively via dynamic(() => import('./MapContainerInner'), { ssr: false })
 * — never evaluated during server-side rendering. This is why Leaflet and the
 * createPinIcon / createDotIcon functions are safe to define here.
 *
 * Layer strategy:
 *  - WMS tiles: batas_wilayah (always)
 *  - GeoJSON polygon layers: all POLYGON features for active categories
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
  useMap,
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

  // Polygon features → rendered as interactive vector polygons
  const POLYGON_TYPES = new Set(["Polygon", "MultiPolygon"]);
  const polygonFeatures = visibleFeatures.filter((f) =>
    POLYGON_TYPES.has(f.geometry.type)
  );

  // ── Click handler factory ────────────────────────────────────────────────

  function makeClickHandler(feature: PotensiFeature) {
    return (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
      const layer = e.target as L.Marker | L.Path;
      // Use the layer's or event target's map for accurate popup placement
      const map: L.Map | undefined =
        (layer as unknown as { _map?: L.Map })?._map ||
        (e.target as unknown as { _map?: L.Map })?._map;
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

  /**
   * MapFocusController ensures that when the page is loaded/reloaded, the map
   * immediately centers and focuses on all active features (points and polygons).
   *
   * It computes the bounds of visible features and accounts for the desktop
   * LayerToggle sidebar (top-left) using paddingTopLeft so features are
   * comfortably centered in the visible map canvas.
   */
  function MapFocusController() {
    const map = useMap();
    const hasFocusedRef = React.useRef(false);

    useEffect(() => {
      if (hasFocusedRef.current) return;
      if (!visibleFeatures || visibleFeatures.length === 0) return;

      const latLngs: [number, number][] = [];
      for (const f of visibleFeatures) {
        if (!f.geometry) continue;
        if (f.geometry.type === "Point") {
          const coords = f.geometry.coordinates as [number, number];
          // GeoJSON coordinate order is [longitude, latitude]
          latLngs.push([coords[1], coords[0]]);
        } else if (f.geometry.type === "Polygon") {
          const coords = f.geometry.coordinates as [number, number][][];
          for (const pt of coords[0] || []) {
            latLngs.push([pt[1], pt[0]]);
          }
        } else if (f.geometry.type === "MultiPolygon") {
          const coords = f.geometry.coordinates as [number, number][][][];
          for (const poly of coords || []) {
            for (const pt of poly[0] || []) {
              latLngs.push([pt[1], pt[0]]);
            }
          }
        }
      }

      if (latLngs.length === 0) return;

      hasFocusedRef.current = true;

      const isDesktop =
        typeof window !== "undefined" && window.innerWidth >= 640;
      const paddingTopLeft: [number, number] = isDesktop
        ? [240, 80]
        : [40, 80];
      const paddingBottomRight: [number, number] = [40, 40];

      if (latLngs.length === 1) {
        map.setView(latLngs[0], 15, { animate: false });
      } else {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, {
          paddingTopLeft,
          paddingBottomRight,
          maxZoom: 15,
          animate: false,
        });
      }
    }, [map]);

    return null;
  }

  return (
    <MapContainer
      center={[-8.2228, 113.6059]}
      zoom={14}
      className="w-full h-full z-0"
    >
      <MapFocusController />
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
                (layer as unknown as { _map?: L.Map })._map ||
                (e.target as unknown as { _map?: L.Map })._map;
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

      {/*
       * ── Vector polygons for POLYGON features ───────────────────────────
       *
       * Rendered directly via GeoJSON vector layers so they are:
       * 1. 100% in sync with the database and immediately appear when input via CMS
       * 2. Interactive with hover highlighting and click-to-open MarkerPopup
       * 3. Consistently styled with the category color theme
       */}
      {polygonFeatures.map((feature) => {
        const kategori = feature.properties.kategori as KategoriSlug;
        const color = CATEGORY_COLORS[kategori] ?? "#0284C7";
        const featureId = feature.id ?? feature.properties?.id ?? Math.random();

        return (
          <GeoJSON
            key={`poly-${kategori}-${featureId}`}
            data={feature as unknown as GeoJSON.Feature}
            style={() => ({
              color: color,
              weight: 2.5,
              opacity: 0.9,
              fillColor: color,
              fillOpacity: 0.35,
            })}
            onEachFeature={(_feat, layer) => {
              layer.on({
                click: makeClickHandler(feature),
                mouseover: (e: L.LeafletMouseEvent) => {
                  const target = e.target as L.Path;
                  target.setStyle({
                    weight: 3.5,
                    fillOpacity: 0.55,
                  });
                },
                mouseout: (e: L.LeafletMouseEvent) => {
                  const target = e.target as L.Path;
                  target.setStyle({
                    weight: 2.5,
                    fillOpacity: 0.35,
                  });
                },
              });
            }}
          />
        );
      })}

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
                // Pins must appear above polygon vector layers
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

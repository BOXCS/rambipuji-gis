"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import { GeoJSON, MapContainer, TileLayer, WMSTileLayer } from "react-leaflet";
import { LAYER_NAMES, getWMSParams, getWMSUrl } from "../lib/geoserver";
import type { KategoriSlug, PotensiCollection, PotensiFeature } from "../types";

export interface MapContainerInnerProps {
  activeLayers: Set<KategoriSlug>;
  onFeatureClick: (
    feature: PotensiFeature,
    containerPoint?: { x: number; y: number }
  ) => void;
  batasWilayahData?: PotensiCollection;
  potensiData?: PotensiCollection;
}

const CATEGORIES: KategoriSlug[] = [
  "pertanian",
  "umkm",
  "wisata",
  "infrastruktur",
];

export default function MapContainerInner({
  activeLayers,
  onFeatureClick,
  batasWilayahData,
  potensiData,
}: MapContainerInnerProps) {
  useEffect(() => {
    // Fix missing Leaflet default icon in Next.js
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

  return (
    <MapContainer
      center={[-8.25, 113.6]}
      zoom={13}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Always visible batas_wilayah WMS layer */}
      <WMSTileLayer
        key="batas_wilayah_wms"
        url={getWMSUrl()}
        {...getWMSParams(LAYER_NAMES["batas-wilayah"])}
      />

      {/* Batas wilayah GeoJSON layer if provided */}
      {batasWilayahData && (
        <GeoJSON
          key="batas_wilayah_geojson"
          data={batasWilayahData as GeoJSON.FeatureCollection}
          style={() => ({
            color: "#1D6A47",
            weight: 2,
            fillOpacity: 0,
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

      {/* Toggleable WMS layers per active category */}
      {CATEGORIES.map((cat) => {
        if (!activeLayers.has(cat)) {
          return null;
        }
        return (
          <WMSTileLayer
            key={cat}
            url={getWMSUrl()}
            {...getWMSParams(LAYER_NAMES[cat])}
          />
        );
      })}

      {/*
       * Invisible GeoJSON click layer — sits on top of WMS dots.
       * WMS serves raster tiles with no click events; this layer renders
       * transparent circleMarkers at the same coordinates so clicks are
       * captured and forwarded to onFeatureClick → MarkerPopup.
       * Only features whose category is currently active are made clickable.
       */}
      {potensiData && potensiData.features.length > 0 && (
        <GeoJSON
          key={`click-layer-${JSON.stringify(Array.from(activeLayers))}-${potensiData.features.length}`}
          data={potensiData as GeoJSON.FeatureCollection}
          pointToLayer={(_feature, latlng) =>
            L.circleMarker(latlng, {
              radius: 14,
              fillColor: "transparent",
              color: "transparent",
              weight: 0,
              fillOpacity: 0,
              opacity: 0,
              interactive: true,
            })
          }
          style={() => ({
            fillOpacity: 0,
            opacity: 0,
            interactive: true,
          })}
          onEachFeature={(feature, layer) => {
            const kategori = (feature as PotensiFeature).properties?.kategori;
            if (!kategori || !activeLayers.has(kategori)) return;
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
    </MapContainer>
  );
}


import type { KategoriSlug } from "../types";

const GEOSERVER_URL =
  process.env.NEXT_PUBLIC_GEOSERVER_URL || "http://localhost:8085/geoserver";

const WORKSPACE = "rambipuji";

export function getWMSUrl(): string {
  return `${GEOSERVER_URL.replace(/\/+$/, "")}/wms`;
}

export function getWMSParams(layerName: string): {
  layers: string;
  format: string;
  transparent: boolean;
  version: string;
  tiled: boolean;
} {
  return {
    layers: `${WORKSPACE}:${layerName}`,
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    tiled: true,
  };
}

export function getWFSUrl(layerName: string): string {
  const baseUrl = GEOSERVER_URL.replace(/\/+$/, "");
  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeName: `${WORKSPACE}:${layerName}`,
    outputFormat: "application/json",
  });
  return `${baseUrl}/wfs?${params.toString()}`;
}

const LAYER_NAMES: Record<KategoriSlug, string> = {
  pertanian: "potensi_pertanian",
  umkm: "potensi_umkm",
  wisata: "potensi_wisata",
  infrastruktur: "potensi_infrastruktur",
  "batas-wilayah": "batas_wilayah",
};

export { LAYER_NAMES };

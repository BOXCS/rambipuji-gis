import type { KategoriSlug } from "../types";

const GEOSERVER_URL =
  process.env.NEXT_PUBLIC_GEOSERVER_URL || "http://localhost:8085/geoserver";

const WORKSPACE = "rambipuji";

export function getWMSUrl(): string {
  return `${GEOSERVER_URL.replace(/\/+$/, "")}/wms`;
}

export function getWMSParams(
  layerName: string,
  bustCache: boolean = false
): Record<string, string | boolean | number> {
  const params: Record<string, string | boolean | number> = {
    layers: `${WORKSPACE}:${layerName}`,
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    tiled: true,
  };

  if (bustCache) {
    // Round to nearest minute so tiles are only re-fetched once per minute,
    // not on every pan/zoom. Used only when freshness is critical (e.g. admin).
    params._t = Math.floor(Date.now() / 60000);
  }

  return params;
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

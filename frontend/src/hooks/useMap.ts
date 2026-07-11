import { useCallback, useState } from "react";
import type { KategoriSlug, PotensiFeature } from "../types";

export function useMap() {
  const [activeLayers, setActiveLayers] = useState<Set<KategoriSlug>>(
    () => new Set<KategoriSlug>(["pertanian", "umkm", "wisata", "infrastruktur"])
  );

  const [selectedFeature, setSelectedFeature] =
    useState<PotensiFeature | null>(null);

  const toggleLayer = useCallback((kategori: KategoriSlug) => {
    if (kategori === "batas-wilayah") {
      // batas-wilayah is always visible (not toggleable)
      return;
    }
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(kategori)) {
        next.delete(kategori);
      } else {
        next.add(kategori);
      }
      return next;
    });
  }, []);

  const selectFeature = useCallback((feature: PotensiFeature | null) => {
    setSelectedFeature(feature);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  return {
    activeLayers,
    selectedFeature,
    toggleLayer,
    selectFeature,
    clearSelection,
  };
}

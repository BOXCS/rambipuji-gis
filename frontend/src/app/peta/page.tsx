"use client";

import { RefreshCw } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import LayerToggle from "../../components/LayerToggle";
import MapContainer from "../../components/MapContainer";
import MarkerPopup from "../../components/MarkerPopup";
import { useMap } from "../../hooks/useMap";
import { usePotensi } from "../../hooks/usePotensi";
import { getStatistik } from "../../lib/api";
import type { StatistikData } from "../../types";

export default function PetaPage() {
  const {
    activeLayers,
    selectedFeature,
    toggleLayer,
    selectFeature,
    clearSelection,
  } = useMap();

  const { data: batasWilayahData } = usePotensi("batas-wilayah");
  // Pass the active layer Set so only currently-visible categories are fetched
  const { data: potensiData } = usePotensi(activeLayers);

  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const [statistik, setStatistik] = useState<StatistikData>({
    pertanian: 0,
    umkm: 0,
    wisata: 0,
    infrastruktur: 0,
    total: 0,
  });

  // Incrementing mapKey forces MapContainer to remount, reloading all WMS tiles
  const [mapKey, setMapKey] = useState(0);

  const handleRefreshMap = useCallback(() => {
    clearSelection();
    setPopupPos(null);
    setMapKey((prev) => prev + 1);
  }, [clearSelection]);

  useEffect(() => {
    let isMounted = true;
    getStatistik()
      .then((data) => {
        if (isMounted && data) {
          setStatistik(data);
        }
      })
      .catch(() => {
        // ignore fallback stats on network failure
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden relative bg-[--bg-surface-raised]">
      {/* Map fills entire viewport — key forces remount on refresh */}
      <MapContainer
        key={mapKey}
        activeLayers={activeLayers}
        onFeatureClick={(feature, point) => {
          selectFeature(feature);
          setPopupPos(point ?? null);
        }}
        batasWilayahData={batasWilayahData || undefined}
        potensiData={potensiData ?? undefined}
      />

      {/* LayerToggle sidebar top-left below navbar */}
      <div className="absolute left-4 top-20 z-40 w-[calc(100vw-2rem)] sm:w-72">
        <LayerToggle
          activeLayers={activeLayers}
          counts={statistik}
          onToggle={toggleLayer}
          onRefresh={handleRefreshMap}
        />
      </div>

      {/* Floating MarkerPopup when a feature is selected */}
      {selectedFeature && (
        <MarkerPopup
          feature={selectedFeature}
          position={popupPos}
          onClose={() => {
            clearSelection();
            setPopupPos(null);
          }}
        />
      )}
    </div>
  );
}

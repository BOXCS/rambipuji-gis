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

// Auto-refresh interval for the GeoJSON layer data (30 seconds).
// This ensures new markers added via the admin panel appear within 30 s
// without any manual action by the visitor.
const POLLING_INTERVAL_MS = 30_000;

export default function PetaPage() {
  const {
    activeLayers,
    selectedFeature,
    toggleLayer,
    selectFeature,
    clearSelection,
  } = useMap();

  const { data: batasWilayahData } = usePotensi("batas-wilayah");

  // Poll every 30 s so new markers appear automatically.
  // refetch() is also wired to the "Refresh Peta" button for on-demand reload.
  const { data: potensiData, refetch } = usePotensi(
    activeLayers,
    POLLING_INTERVAL_MS
  );

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

  // Refresh handler: immediately re-fetch GeoJSON data without remounting the map.
  // This preserves the current zoom/pan position — far less disruptive than
  // the previous mapKey remount approach.
  const handleRefreshMap = useCallback(async () => {
    clearSelection();
    setPopupPos(null);
    await refetch();
  }, [clearSelection, refetch]);

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
      {/* Map fills entire viewport */}
      <MapContainer
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

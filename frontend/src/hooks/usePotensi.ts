import { useCallback, useEffect, useRef, useState } from "react";
import { getPotensiAll, getPotensiByKategori } from "../lib/api";
import type { KategoriSlug, PotensiCollection } from "../types";

const ALL_KATEGORI: KategoriSlug[] = [
  "pertanian",
  "umkm",
  "wisata",
  "infrastruktur",
];

/**
 * Fetch potensi GeoJSON data with optional polling.
 *
 * Overloads:
 *   usePotensi()                            — fetch all categories
 *   usePotensi(kategori)                    — fetch a single fixed kategori
 *   usePotensi(aktiveLayers)               — fetch only the given Set of kategoris
 *   usePotensi(aktiveLayers, pollingMs)    — same, plus auto-refresh every N ms
 *
 * Returns { data, loading, error, refetch } where refetch() can be called
 * imperatively (e.g. from the "Refresh Peta" button) to force an immediate
 * re-fetch without remounting the map.
 */
export function usePotensi(
  kategoríOrLayers?: KategoriSlug | Set<KategoriSlug>,
  pollingInterval?: number
): {
  data: PotensiCollection | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<PotensiCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Derive a stable string key for the effect dep array without referencing
  // the mutable Set directly (Sets are reference-equal only after the same
  // toggle, so we sort and join the slugs).
  const depsKey: string = (() => {
    if (!kategoríOrLayers) return "__all__";
    if (typeof kategoríOrLayers === "string") return kategoríOrLayers;
    return Array.from(kategoríOrLayers).sort().join(",");
  })();

  // Keep a ref to the current depsKey so fetchData() closure stays stable
  // even when the Set changes identity (avoids stale closure in polling).
  const depsKeyRef = useRef(depsKey);
  depsKeyRef.current = depsKey;

  // Keep a ref to the current kategoríOrLayers value for the same reason.
  const layersRef = useRef(kategoríOrLayers);
  layersRef.current = kategoríOrLayers;

  // Core data-fetching function. useCallback with [] ensures it is a stable
  // reference for polling; it reads current layer config via refs.
  const fetchData = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined") return;

    const current = layersRef.current;

    try {
      if (!current) {
        // No argument — fetch all categories via combined call
        const result = await getPotensiAll();
        setData(result);
        setError(null);
        return;
      }

      if (typeof current === "string") {
        // Single kategori slug
        const result = await getPotensiByKategori(current);
        setData(result);
        setError(null);
        return;
      }

      // Set<KategoriSlug> — fetch only the active layers in parallel
      const slugs: KategoriSlug[] =
        current.size > 0 ? (Array.from(current) as KategoriSlug[]) : ALL_KATEGORI;

      const results = await Promise.all(
        slugs.map((k) => getPotensiByKategori(k))
      );

      setData({
        type: "FeatureCollection",
        features: results.flatMap((r) => r.features ?? []),
      });
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []); // stable — reads layers via ref

  // ── Initial fetch on mount / when layer set changes ───────────────────────
  useEffect(() => {
    setLoading(true);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]); // re-run only when slug set actually changes

  // ── Optional polling ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!pollingInterval || pollingInterval <= 0) return;

    const timer = setInterval(() => {
      fetchData();
    }, pollingInterval);

    return () => {
      clearInterval(timer);
    };
  }, [fetchData, pollingInterval]);

  return { data, loading, error, refetch: fetchData };
}

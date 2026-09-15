import { useEffect, useState } from "react";
import { getPotensiAll, getPotensiByKategori } from "../lib/api";
import type { KategoriSlug, PotensiCollection } from "../types";

const ALL_KATEGORI: KategoriSlug[] = [
  "pertanian",
  "umkm",
  "wisata",
  "infrastruktur",
];

/**
 * Fetch potensi GeoJSON data.
 *
 * Overloads:
 *   usePotensi()                   — fetch a single fixed kategori (original signature)
 *   usePotensi(kategori)           — fetch a single fixed kategori
 *   usePotensi(aktiveLayers)       — fetch only the given Set of kategoris (map page)
 *
 * When called with a Set<KategoriSlug>, only the layers in that set are fetched.
 * This enables the map page to avoid loading all categories at once —
 * it requests only what the layer toggle currently shows.
 */
export function usePotensi(
  kategoríOrLayers?: KategoriSlug | Set<KategoriSlug>
): { data: PotensiCollection | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<PotensiCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Derive a stable key for the effect dep array without referencing mutable Set directly
  const depsKey: string = (() => {
    if (!kategoríOrLayers) return "__all__";
    if (typeof kategoríOrLayers === "string") return kategoríOrLayers;
    // Set<KategoriSlug> — sort for stable key
    return Array.from(kategoríOrLayers).sort().join(",");
  })();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isCancelled = false;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        if (!kategoríOrLayers) {
          // No argument — fetch all via the combined endpoint
          const result = await getPotensiAll();
          if (!isCancelled) {
            setData(result);
          }
          return;
        }

        if (typeof kategoríOrLayers === "string") {
          // Single kategori — fetch one
          const result = await getPotensiByKategori(kategoríOrLayers);
          if (!isCancelled) {
            setData(result);
          }
          return;
        }

        // Set<KategoriSlug> — fetch only the active layers in parallel
        const slugs =
          kategoríOrLayers.size > 0
            ? (Array.from(kategoríOrLayers) as KategoriSlug[])
            : ALL_KATEGORI;

        const results = await Promise.all(slugs.map((k) => getPotensiByKategori(k)));

        if (!isCancelled) {
          setData({
            type: "FeatureCollection",
            features: results.flatMap((r) => r.features ?? []),
          });
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  return { data, loading, error };
}

import { useEffect, useState } from "react";
import { getPotensiAll, getPotensiByKategori } from "../lib/api";
import type { KategoriSlug, PotensiCollection } from "../types";

export function usePotensi(kategori?: KategoriSlug) {
  const [data, setData] = useState<PotensiCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    const requestPromise = kategori
      ? getPotensiByKategori(kategori)
      : getPotensiAll();

    requestPromise
      .then((result) => {
        if (!isCancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const errorObj =
            err instanceof Error ? err : new Error(String(err));
          setError(errorObj);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [kategori]);

  return { data, loading, error };
}

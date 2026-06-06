/* Basit veri çekme hook'u — apiClient üzerinden GET, loading/error/reload durumlu.
 * `rev` değişince yeniden çeker (ör. ödev sonucu kaydından sonra). */
import { useCallback, useEffect, useState } from "react";
import { api } from "./apiClient";
import { ApiError } from "./api-error";

export interface ApiData<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useApiData<T>(path: string, rev = 0): ApiData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api<T>(path)
      .then((d) => {
        if (active) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (active) {
          setError(e instanceof ApiError ? e.message : "Veri yüklenemedi");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [path, rev, nonce]);

  return { data, loading, error, reload };
}

import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an API call on mount (and whenever deps change) and tracks loading/error.
// `reload()` refreshes in the background when data is already on screen, so a
// page does not flash a spinner after every save. `setData` allows local updates.
export function useApi(fetcher, deps = []) {
  const [data, setDataState] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  const dataRef = useRef(null);

  const setData = useCallback((value) => {
    setDataState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      dataRef.current = next;
      return next;
    });
  }, []);

  const load = useCallback(
    ({ fresh = false } = {}) => {
      const id = ++requestId.current;
      const background = !fresh && dataRef.current !== null;
      if (!background) {
        setLoading(true);
        setError(null);
        if (fresh) setData(null);
      }
      return fetcher()
        .then((result) => {
          if (id === requestId.current) {
            setData(result);
            setError(null);
          }
        })
        .catch((err) => {
          if (id === requestId.current) setError(err);
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false);
        });
    },
    deps
  );

  useEffect(() => {
    load({ fresh: true });
  }, [load]);

  const reload = useCallback(() => load(), [load]);

  return { data, setData, error, loading, reload };
}

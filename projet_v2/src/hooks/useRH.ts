import { useState, useEffect, useRef, useCallback } from 'react';

export function useApiData<T>(fetcher: () => Promise<{ data: T }>) {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetcherRef.current()
      .then((res)  => { if (active) setData(res.data);  })
      .catch((err) => { if (active) setError(err?.response?.data?.error || err.message); })
      .finally(()  => { if (active) setLoading(false);  });
    return () => { active = false; };
  }, [tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);
  return { data, loading, error, refetch };
}

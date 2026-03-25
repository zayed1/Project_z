// ============================================
// SWR-style Cache Hook | خطاف التخزين المؤقت الذكي
// ============================================
import { useState, useEffect, useRef, useCallback } from 'react';

// كاش عام في الذاكرة | In-memory global cache
const cache = new Map();
const STALE_TIME = 60 * 1000; // 1 minute

export function useCache(key, fetcher, options = {}) {
  const { staleTime = STALE_TIME, enabled = true } = options;
  const [data, setData] = useState(() => cache.get(key)?.data ?? null);
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcherRef.current();
      cache.set(key, { data: result, timestamp: Date.now() });
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!enabled) return;

    const cached = cache.get(key);
    if (cached) {
      setData(cached.data);
      // إعادة الجلب إذا البيانات قديمة | Revalidate if stale
      if (Date.now() - cached.timestamp > staleTime) {
        refetch();
      } else {
        setLoading(false);
      }
    } else {
      refetch();
    }
  }, [key, staleTime, enabled, refetch]);

  return { data, loading, error, refetch };
}

// تنظيف الكاش | Invalidate cache
export function invalidateCache(keyPrefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key);
  }
}

// ============================================
// خطاف التمرير اللانهائي | Infinite Scroll Hook
// ============================================
import { useState, useEffect, useCallback, useRef } from 'react';

export default function useInfiniteScroll(fetchFn, { pageSize = 10, deps = [] } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newItems = await fetchFn(page, pageSize);
      if (newItems.length < pageSize) setHasMore(false);
      setItems((prev) => [...prev, ...newItems]);
      setPage((p) => p + 1);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFn, pageSize]);

  // إعادة ضبط عند تغيير الاعتمادات | Reset on deps change
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
  }, deps);

  // مراقب العنصر الأخير | Last element observer
  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  return { items, loading, hasMore, lastItemRef, loadMore, setItems };
}

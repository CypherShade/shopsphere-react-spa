import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic infinite loader driven by an IntersectionObserver sentinel.
 * @param {(skip:number, signal:AbortSignal) => Promise<{items:any[], total:number}>} fetchPage
 * @param {any} resetKey - changing this clears the list (e.g. a new category slug)
 */
export function useInfiniteScroll(fetchPage, resetKey) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(Infinity);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const inFlight = useRef(false);
  const controller = useRef(null);
  const observer = useRef(null);
  const loaded = useRef(0);

  const hasMore = loaded.current < total;

  const loadMore = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    const ctrl = new AbortController();
    controller.current = ctrl;
    try {
      const page = await fetchPage(loaded.current, ctrl.signal);
      if (ctrl.signal.aborted) return;
      loaded.current += page.items.length;
      setItems((prev) => [...prev, ...page.items]);
      setTotal(page.total);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err);
    } finally {
      if (controller.current === ctrl) {
        inFlight.current = false;
        setLoading(false);
      }
    }
  }, [fetchPage]);

  // Reset and load the first page whenever the data source changes
  useEffect(() => {
    controller.current?.abort();
    inFlight.current = false;
    loaded.current = 0;
    setItems([]);
    setTotal(Infinity);
    setError(null);
    loadMore();
    return () => controller.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Callback ref: (re)attach the observer to the sentinel node. It is re-created each time a
  // batch finishes (`loading` flips to false) because a fresh observe() always reports the
  // current intersection - so if one batch doesn't fill the screen, the next loads immediately.
  const sentinelRef = useCallback(
    (node) => {
      observer.current?.disconnect();
      if (!node || !hasMore || error || loading) return;
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) loadMore();
        },
        { rootMargin: '400px 0px' } // prefetch before the user actually hits the bottom
      );
      observer.current.observe(node);
    },
    [hasMore, error, loading, loadMore]
  );

  useEffect(() => () => observer.current?.disconnect(), []);

  return { items, total, loading, error, hasMore, sentinelRef, retry: loadMore };
}

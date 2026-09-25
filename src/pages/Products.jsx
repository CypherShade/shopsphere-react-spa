import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAGE_SIZE, PRODUCT_SORTS, catalogUrl, parseCatalogParams } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import ProductGrid from '../components/ui/ProductGrid';
import Pagination from '../components/ui/Pagination';
import { GridSkeleton } from '../components/ui/Skeleton';
import StateBox from '../components/ui/StateBox';
import { SearchIcon } from '../components/ui/Icons';

export default function Products() {
  useDocumentTitle('Products');
  // The URL is the single source of truth for q / page / sort: shareable & back-button friendly
  const [params, setParams] = useSearchParams();
  const { q, sort, page } = parseCatalogParams(params);

  const [input, setInput] = useState(q);
  const [inStockOnly, setInStockOnly] = useState(false);
  const debounced = useDebounce(input.trim(), 400);

  const updateParams = useCallback(
    (patch, { replace = false } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, String(v)) : next.delete(k)));
          return next;
        },
        { replace }
      );
    },
    [setParams]
  );

  // Push the debounced search term to the URL (one update per pause, not per keystroke).
  // Only fires when the *debounced value* changes, so back/forward navigation is never undone.
  const lastPushed = useRef(debounced);
  useEffect(() => {
    if (debounced === lastPushed.current) return;
    lastPushed.current = debounced;
    if (debounced !== q) updateParams({ q: debounced, page: null }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Keep the input in sync when q changes via back/forward navigation
  useEffect(() => {
    lastPushed.current = q;
    setInput((current) => (current.trim() === q ? current : q));
  }, [q]);

  // Same URL the route loader already prefetched, so this usually resolves from cache
  const url = useMemo(() => catalogUrl({ q, sort, page }), [q, sort, page]);
  const { data, loading, error, refetch } = useFetch(url, { keepPrevious: true });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  // Client-side filter over the current page, recomputed only when its inputs change
  const visible = useMemo(
    () => (data ? (inStockOnly ? data.products.filter((p) => p.stock > 0) : data.products) : []),
    [data, inStockOnly]
  );

  const onPageChange = useCallback(
    (p) => {
      updateParams({ page: p > 1 ? p : null });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateParams]
  );

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>All products</h1>
          <p className="muted" aria-live="polite">
            {data ? `${data.total} results${q ? ` for “${q}”` : ''}` : 'Loading catalog…'}
          </p>
        </div>
      </header>

      <div className="toolbar">
        <label className="search">
          <SearchIcon width={18} height={18} />
          <span className="sr-only">Search products</span>
          <input
            type="search"
            placeholder="Search phones, perfume, laptops…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <label className="field-inline">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: null })}>
            {Object.entries(PRODUCT_SORTS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
          In stock only
        </label>
      </div>

      {error ? (
        <StateBox
          title="Couldn't load products"
          role="alert"
          action={<button className="btn btn--primary" onClick={refetch}>Retry</button>}
        >
          {error.message}
        </StateBox>
      ) : !data ? (
        <GridSkeleton count={PAGE_SIZE} />
      ) : visible.length === 0 ? (
        <StateBox title="No products found">Try a different search term or clear the filters.</StateBox>
      ) : (
        <div className={loading ? 'is-refreshing' : undefined} aria-busy={loading}>
          <h2 className="sr-only">Results</h2>
          <ProductGrid products={visible} />
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}

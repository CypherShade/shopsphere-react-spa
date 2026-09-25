import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { endpoints, fetchJSON } from '../api/client';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { titleCase } from '../utils/format';
import ProductGrid from '../components/ui/ProductGrid';
import { GridSkeleton } from '../components/ui/Skeleton';
import StateBox from '../components/ui/StateBox';

const BATCH = 8;

export default function CategoryProducts() {
  const { slug } = useParams();
  const name = titleCase(slug);
  useDocumentTitle(name);

  // Stable fetcher per slug so the infinite-scroll hook doesn't reset on every render
  const fetchPage = useCallback(
    async (skip, signal) => {
      const data = await fetchJSON(endpoints.byCategory(slug, { skip, limit: BATCH }), { signal });
      return { items: data.products, total: data.total };
    },
    [slug]
  );

  const { items, total, loading, error, hasMore, sentinelRef, retry } = useInfiniteScroll(fetchPage, slug);

  const empty = !loading && !error && items.length === 0;

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / <span>{name}</span>
      </nav>
      <header className="page__head">
        <div>
          <h1>{name}</h1>
          <p className="muted" aria-live="polite">
            {Number.isFinite(total) ? `Showing ${items.length} of ${total}` : 'Loading…'}
          </p>
        </div>
      </header>

      {empty ? (
        <StateBox title="Nothing here yet" action={<Link className="btn btn--primary" to="/categories">Browse categories</Link>}>
          No products found in “{name}”.
        </StateBox>
      ) : (
        <>
          {items.length > 0 && <ProductGrid products={items} />}
          {loading && <div className="spacer-top"><GridSkeleton count={items.length ? 4 : BATCH} /></div>}
        </>
      )}

      {error && (
        <StateBox title="Couldn't load more products" role="alert" action={<button className="btn btn--primary" onClick={retry}>Retry</button>}>
          {error.message}
        </StateBox>
      )}

      {/* Sentinel: when it scrolls into view the next batch is requested */}
      {hasMore && !error && <div ref={sentinelRef} className="sentinel" aria-hidden="true" />}
      {!hasMore && items.length > 0 && <p className="end-note">You've reached the end · {total} products</p>}
    </div>
  );
}

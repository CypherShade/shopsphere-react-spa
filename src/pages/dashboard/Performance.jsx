import { useState } from 'react';
import { useWebVitals } from '../../hooks/useWebVitals';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const METRICS = [
  { key: 'LCP', name: 'Largest Contentful Paint', unit: 'ms', good: 2500 },
  { key: 'CLS', name: 'Cumulative Layout Shift', unit: '', good: 0.1 },
  { key: 'INP', name: 'Interaction to Next Paint', unit: 'ms', good: 200 },
  { key: 'FCP', name: 'First Contentful Paint', unit: 'ms', good: 1800 },
  { key: 'TTFB', name: 'Time to First Byte', unit: 'ms', good: 800 },
];

const OPTIMISATIONS = [
  'Route-level code splitting with React.lazy + Suspense (13 lazy chunks)',
  'Vendor chunks (react, router, redux) split for long-term caching',
  'React.memo on ProductCard, ProductGrid, CartRow, Navbar, Pagination, Rating, SmartImage',
  'useMemo / createSelector for derived lists and cart totals; useCallback for handlers passed to memoised children',
  'Images: WebP from CDN, explicit width/height, loading="lazy", fetchpriority="high" on the LCP image',
  'Skeletons with identical dimensions to real content (no layout shift)',
  'Preconnect to API + image CDN; theme applied before first paint',
  'Route loaders start API requests in parallel with lazy chunk downloads (no request waterfall)',
  'useFetch: in-memory cache, in-flight request de-duplication, hover prefetch of product details',
  'Stale responses ignored (useFetch) / aborted with AbortController (useInfiniteScroll); debounced search cuts API calls'
];

function format(metric, value) {
  if (value === undefined) return '—';
  return metric.unit ? `${Math.round(value)} ${metric.unit}` : value.toFixed(3);
}

function Bomb({ armed }) {
  if (armed) throw new Error('Simulated render crash: caught by the nearest ErrorBoundary.');
  return null;
}

export default function Performance() {
  useDocumentTitle('Performance');
  const vitals = useWebVitals();
  const [armed, setArmed] = useState(false);

  return (
    <div className="stack">
      <h1>Performance &amp; Web Vitals</h1>
      <p className="muted">
        Live field metrics for this session, collected with the <code>web-vitals</code> library. INP updates after
        you interact with the page.
      </p>

      <div className="vitals">
        {METRICS.map((m) => {
          const v = vitals[m.key];
          return (
            <div key={m.key} className={`card vital vital--${v?.rating ?? 'pending'}`}>
              <span className="vital__key">{m.key}</span>
              <strong className="vital__value">{format(m, v?.value)}</strong>
              <span className="muted small">{m.name}</span>
              <span className="small">Good ≤ {m.unit ? `${m.good} ms` : m.good}</span>
            </div>
          );
        })}
      </div>

      <div className="card pad">
        <h2 className="h3">Optimisations applied</h2>
        <ul className="checklist">
          {OPTIMISATIONS.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>

      <div className="card pad stack">
        <h2 className="h3">Error boundary demo</h2>
        <p className="muted">Throws during render; only this panel is replaced by the fallback UI.</p>
        <ErrorBoundary
          fallback={({ error, reset }) => (
            <div className="notice" role="alert">
              <p>{error.message}</p>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => {
                  setArmed(false);
                  reset();
                }}
              >
                Recover
              </button>
            </div>
          )}
        >
          <Bomb armed={armed} />
          <button className="btn btn--ghost" onClick={() => setArmed(true)}>
            Trigger a crash
          </button>
        </ErrorBoundary>
      </div>
    </div>
  );
}

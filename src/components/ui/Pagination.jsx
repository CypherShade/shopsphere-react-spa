import { memo, useMemo } from 'react';

/** Builds a compact page list like: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(current, total, radius = 1) {
  const pages = new Set([1, total]);
  for (let p = current - radius; p <= current + radius; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}

function Pagination({ page, totalPages, onChange }) {
  const pages = useMemo(() => pageWindow(page, totalPages), [page, totalPages]);
  // Keep the bar's space reserved even with a single page, so results changing never shift the layout
  if (totalPages <= 1) return <div className="pagination" aria-hidden="true" />;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn--ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹ Prev
      </button>
      {pages.map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="pagination__gap">…</span>
        ) : (
          <button
            key={p}
            className={`btn btn--ghost pagination__page ${p === page ? 'is-active' : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button className="btn btn--ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next ›
      </button>
    </nav>
  );
}

export default memo(Pagination);

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Skeleton } from '../components/ui/Skeleton';
import StateBox from '../components/ui/StateBox';
import { SearchIcon } from '../components/ui/Icons';

export default function Categories() {
  useDocumentTitle('Categories');
  const { data, loading, error, refetch } = useFetch(endpoints.categories());
  const [filter, setFilter] = useState('');
  const debounced = useDebounce(filter.trim().toLowerCase(), 200);

  const filtered = useMemo(
    () => (data ?? []).filter((c) => c.name.toLowerCase().includes(debounced)),
    [data, debounced]
  );

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>Categories</h1>
          <p className="muted">Each category page uses infinite scroll.</p>
        </div>
        <label className="search search--compact">
          <SearchIcon width={18} height={18} />
          <span className="sr-only">Filter categories</span>
          <input type="search" placeholder="Filter categories…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </label>
      </header>

      {error ? (
        <StateBox title="Couldn't load categories" role="alert" action={<button className="btn btn--primary" onClick={refetch}>Retry</button>}>
          {error.message}
        </StateBox>
      ) : loading || !data ? (
        <div className="cat-grid" role="status" aria-label="Loading categories">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} height={88} radius={14} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <StateBox title="No matching categories" />
      ) : (
        <div className="cat-grid">
          {filtered.map((c, i) => (
            <Link key={c.slug} to={`/categories/${c.slug}`} className="chip-card" style={{ '--hue': (i * 37) % 360 }}>
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

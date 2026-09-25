import { Link } from 'react-router-dom';
import { topRatedUrl } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import ProductGrid from '../components/ui/ProductGrid';
import { GridSkeleton } from '../components/ui/Skeleton';
import StateBox from '../components/ui/StateBox';

const FEATURED = [
  { slug: 'smartphones', label: 'Smartphones', hue: 250 },
  { slug: 'laptops', label: 'Laptops', hue: 200 },
  { slug: 'fragrances', label: 'Fragrances', hue: 320 },
  { slug: 'skin-care', label: 'Skin Care', hue: 20 },
  { slug: 'groceries', label: 'Groceries', hue: 130 },
  { slug: 'home-decoration', label: 'Home Decor', hue: 45 },
];

export default function Home() {
  useDocumentTitle('Home');
  const { data, loading, error, refetch } = useFetch(topRatedUrl);

  return (
    <>
      {/* The hero is pure text + CSS gradient: it renders as the LCP element with no network wait */}
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow">Phase 3 · Advanced React Engineering</p>
          <h1 className="hero__title">
            Shop smarter with a <span className="gradient-text">lightning-fast</span> storefront
          </h1>
          <p className="hero__lead">
            194 products, instant search, infinite scrolling categories and a persistent cart,
            all powered by code-split routes, memoised components and custom hooks.
          </p>
          <div className="row">
            <Link to="/products" className="btn btn--primary btn--lg">
              Browse catalog
            </Link>
            <Link to="/categories" className="btn btn--ghost btn--lg">
              Explore categories
            </Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Popular categories</h2>
          <Link to="/categories">View all →</Link>
        </div>
        <div className="chips">
          {FEATURED.map((c) => (
            <Link
              key={c.slug}
              to={`/categories/${c.slug}`}
              className="chip-card"
              style={{ '--hue': c.hue }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Top rated</h2>
          <Link to="/products?sort=rating-desc">See more →</Link>
        </div>
        {error ? (
          <StateBox
            title="Couldn't load products"
            role="alert"
            action={<button className="btn btn--primary" onClick={refetch}>Retry</button>}
          >
            {error.message}
          </StateBox>
        ) : loading || !data ? (
          <GridSkeleton count={8} />
        ) : (
          <ProductGrid products={data.products} eager={false} />
        )}
      </section>
    </>
  );
}

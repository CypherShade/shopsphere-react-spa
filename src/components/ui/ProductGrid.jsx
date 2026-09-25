import { memo } from 'react';
import ProductCard from './ProductCard';

/** First row of cards is above the fold, so it loads eagerly with high priority (LCP) */
const EAGER_COUNT = 4;

function ProductGrid({ products, eager = true }) {
  return (
    <div className="grid">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={eager && i < EAGER_COUNT} />
      ))}
    </div>
  );
}

export default memo(ProductGrid);

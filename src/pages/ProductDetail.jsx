import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { endpoints } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { addToCart, selectQtyInCart, updateQty } from '../store/cartSlice';
import { selectIsWishlisted, toggleWishlist } from '../store/wishlistSlice';
import { discounted, formatPrice, titleCase } from '../utils/format';
import SmartImage from '../components/ui/SmartImage';
import Rating from '../components/ui/Rating';
import ProductGrid from '../components/ui/ProductGrid';
import StateBox from '../components/ui/StateBox';
import { DetailSkeleton, GridSkeleton } from '../components/ui/Skeleton';
import { HeartIcon } from '../components/ui/Icons';

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data: product, loading, error, refetch } = useFetch(endpoints.product(productId));
  useDocumentTitle(product?.title ?? 'Product');

  if (error) {
    return (
      <div className="container page">
        <StateBox
          title={error.status === 404 ? 'Product not found' : 'Something went wrong'}
          role="alert"
          action={
            <div className="row">
              {error.status !== 404 && <button className="btn btn--primary" onClick={refetch}>Retry</button>}
              <button className="btn btn--ghost" onClick={() => navigate('/products')}>Back to catalog</button>
            </div>
          }
        >
          {error.status === 404 ? `There is no product with id “${productId}”.` : error.message}
        </StateBox>
      </div>
    );
  }

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link>
        {product && (
          <>
            {' / '}
            <Link to={`/categories/${product.category}`}>{titleCase(product.category)}</Link>
          </>
        )}
      </nav>
      {loading || !product ? <DetailSkeleton /> : <ProductView key={product.id} product={product} />}
      {product && <Related category={product.category} excludeId={product.id} />}
    </div>
  );
}

function ProductView({ product }) {
  const dispatch = useDispatch();
  const inCart = useSelector(selectQtyInCart(product.id));
  const wished = useSelector(selectIsWishlisted(product.id));
  const images = product.images?.length ? product.images : [product.thumbnail];
  const [active, setActive] = useState(0);
  const price = discounted(product.price, product.discountPercentage);

  return (
    <article className="detail">
      <div className="detail__gallery">
        <div className="detail__main-img">
          {/* LCP candidate on this route: loaded eagerly with high fetch priority */}
          <SmartImage src={images[active]} alt={product.title} width={600} height={600} priority />
        </div>
        {images.length > 1 && (
          <div className="detail__thumbs" role="tablist" aria-label="Product images">
            {images.map((src, i) => (
              <button
                key={src}
                role="tab"
                aria-selected={i === active}
                className={i === active ? 'is-active' : ''}
                onClick={() => setActive(i)}
              >
                <SmartImage src={src} alt={`${product.title} view ${i + 1}`} width={72} height={72} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="detail__info stack">
        <p className="eyebrow">{product.brand ?? titleCase(product.category)}</p>
        <h1>{product.title}</h1>
        <div className="row">
          <Rating value={product.rating} />
          <span className="muted">{product.reviews?.length ?? 0} reviews</span>
          <span className={`badge ${product.stock > 0 ? 'badge--ok' : 'badge--sale'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        <p className="detail__price">
          {formatPrice(price)}
          {product.discountPercentage >= 1 && (
            <>
              <s>{formatPrice(product.price)}</s>
              <span className="badge badge--sale">-{Math.round(product.discountPercentage)}%</span>
            </>
          )}
        </p>
        <p>{product.description}</p>

        <div className="row">
          {inCart > 0 ? (
            <div className="qty" aria-label="Quantity in cart">
              <button onClick={() => dispatch(updateQty({ id: product.id, qty: inCart - 1 }))} aria-label="Decrease">−</button>
              <span>{inCart}</span>
              <button onClick={() => dispatch(addToCart(product))} disabled={inCart >= product.stock} aria-label="Increase">+</button>
            </div>
          ) : (
            <button className="btn btn--primary btn--lg" disabled={product.stock === 0} onClick={() => dispatch(addToCart(product))}>
              Add to cart
            </button>
          )}
          <button
            className={`btn btn--ghost btn--lg ${wished ? 'is-active' : ''}`}
            aria-pressed={wished}
            onClick={() => dispatch(toggleWishlist(product))}
          >
            <HeartIcon filled={wished} width={18} height={18} /> {wished ? 'Wishlisted' : 'Wishlist'}
          </button>
          {inCart > 0 && <Link to="/cart" className="btn btn--ghost btn--lg">Go to cart →</Link>}
        </div>

        <dl className="specs">
          {[
            ['SKU', product.sku],
            ['Warranty', product.warrantyInformation],
            ['Shipping', product.shippingInformation],
            ['Returns', product.returnPolicy],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>

        {product.reviews?.length > 0 && (
          <section>
            <h2 className="h3">Customer reviews</h2>
            <ul className="reviews">
              {product.reviews.map((r, i) => (
                <li key={i}>
                  <div className="row">
                    <strong>{r.reviewerName}</strong>
                    <Rating value={r.rating} />
                  </div>
                  <p>{r.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

function Related({ category, excludeId }) {
  const { data } = useFetch(endpoints.byCategory(category, { limit: 5 }));
  const related = useMemo(
    () => (data ? data.products.filter((p) => p.id !== excludeId).slice(0, 4) : null),
    [data, excludeId]
  );
  if (related && related.length === 0) return null;
  return (
    <section className="section">
      <h2>More in {titleCase(category)}</h2>
      {related ? <ProductGrid products={related} eager={false} /> : <GridSkeleton count={4} />}
    </section>
  );
}

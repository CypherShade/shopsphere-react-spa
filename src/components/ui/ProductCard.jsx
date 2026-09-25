import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectQtyInCart } from '../../store/cartSlice';
import { selectIsWishlisted, toggleWishlist } from '../../store/wishlistSlice';
import { endpoints } from '../../api/client';
import { prefetch } from '../../hooks/useFetch';
import { discounted, formatPrice, titleCase } from '../../utils/format';
import SmartImage from './SmartImage';
import Rating from './Rating';
import { HeartIcon } from './Icons';

/**
 * Memoised card: re-renders only when its own `product` prop, cart quantity or
 * wishlist flag changes - not when siblings or the parent grid update.
 */
function ProductCard({ product, priority = false }) {
  const dispatch = useDispatch();
  const inCart = useSelector(selectQtyInCart(product.id));
  const wished = useSelector(selectIsWishlisted(product.id));

  const onAdd = useCallback(() => dispatch(addToCart(product)), [dispatch, product]);
  const onWish = useCallback(() => dispatch(toggleWishlist(product)), [dispatch, product]);
  // Warm the detail-page cache so navigation feels instant
  const onIntent = useCallback(() => prefetch(endpoints.product(product.id)), [product.id]);

  const outOfStock = product.stock === 0;
  const sale = product.discountPercentage >= 1;

  return (
    <article className="card product-card">
      {/* Decorative duplicate of the title link: hidden from keyboard & screen readers */}
      <Link
        to={`/products/${product.id}`}
        className="product-card__media"
        onMouseEnter={onIntent}
        tabIndex={-1}
        aria-hidden="true"
      >
        <SmartImage src={product.thumbnail} alt="" width={300} height={300} priority={priority} />
      </Link>
      {sale && (
        <span className="badge badge--sale product-card__badge">
          -{Math.round(product.discountPercentage)}%<span className="sr-only"> off</span>
        </span>
      )}
      <button
        type="button"
        className={`icon-btn product-card__wish ${wished ? 'is-active' : ''}`}
        onClick={onWish}
        aria-pressed={wished}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <HeartIcon filled={wished} width={18} height={18} />
      </button>
      <div className="product-card__body">
        <p className="product-card__cat">{titleCase(product.category)}</p>
        <h3 className="product-card__title">
          <Link to={`/products/${product.id}`} onMouseEnter={onIntent} onFocus={onIntent}>
            {product.title}
          </Link>
        </h3>
        <div className="product-card__meta">
          <span className="price">
            {formatPrice(discounted(product.price, product.discountPercentage))}
            {sale && <s>{formatPrice(product.price)}</s>}
          </span>
          <Rating value={product.rating} />
        </div>
        <button type="button" className="btn btn--primary btn--block" onClick={onAdd} disabled={outOfStock}>
          {outOfStock ? 'Out of stock' : inCart ? `In cart (${inCart}) · Add more` : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

export default memo(ProductCard);

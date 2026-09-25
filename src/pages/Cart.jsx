import { memo, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, removeFromCart, selectCartItems, selectCartTotals, updateQty } from '../store/cartSlice';
import { placeOrder } from '../store/ordersSlice';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { discounted, formatPrice } from '../utils/format';
import SmartImage from '../components/ui/SmartImage';
import StateBox from '../components/ui/StateBox';

// Memoised row: changing one item's quantity doesn't re-render the other rows
const CartRow = memo(function CartRow({ item, onQty, onRemove }) {
  const unit = discounted(item.price, item.discountPercentage);
  return (
    <li className="cart-row">
      <SmartImage src={item.thumbnail} alt="" width={80} height={80} />
      <div className="cart-row__info">
        <Link to={`/products/${item.id}`}>{item.title}</Link>
        <span className="muted">{formatPrice(unit)} each</span>
      </div>
      <div className="qty" aria-label={`Quantity for ${item.title}`}>
        <button onClick={() => onQty(item.id, item.qty - 1)} aria-label="Decrease">−</button>
        <span>{item.qty}</span>
        <button onClick={() => onQty(item.id, item.qty + 1)} disabled={item.qty >= item.stock} aria-label="Increase">+</button>
      </div>
      <strong className="cart-row__total">{formatPrice(unit * item.qty)}</strong>
      <button className="btn btn--ghost btn--sm" onClick={() => onRemove(item.id)}>
        Remove
      </button>
    </li>
  );
});

export default function Cart() {
  useDocumentTitle('Cart');
  const items = useSelector(selectCartItems);
  const { subtotal, savings, total } = useSelector(selectCartTotals);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [placing, setPlacing] = useState(false);

  // Stable callbacks so memoised rows skip re-rendering
  const onQty = useCallback((id, qty) => dispatch(updateQty({ id, qty })), [dispatch]);
  const onRemove = useCallback((id) => dispatch(removeFromCart(id)), [dispatch]);

  const checkout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 600));
    dispatch(placeOrder({ items, total }));
    dispatch(clearCart());
    navigate('/dashboard/orders', { state: { justOrdered: true } });
  };

  if (items.length === 0) {
    return (
      <div className="container page">
        <StateBox title="Your cart is empty" action={<Link to="/products" className="btn btn--primary">Start shopping</Link>}>
          Items you add will be saved even if you close the tab.
        </StateBox>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Shopping cart</h1>
      <div className="cart-layout">
        <ul className="card cart-list">
          {items.map((item) => (
            <CartRow key={item.id} item={item} onQty={onQty} onRemove={onRemove} />
          ))}
        </ul>
        <aside className="card summary" aria-label="Order summary">
          <h2 className="h3">Summary</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div><dt>Discounts</dt><dd className="ok">−{formatPrice(savings)}</dd></div>
            <div><dt>Shipping</dt><dd>Free</dd></div>
            <div className="summary__total"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
          <button className="btn btn--primary btn--block btn--lg" onClick={checkout} disabled={placing}>
            {placing ? 'Placing order…' : isAuthenticated ? 'Place order' : 'Sign in to checkout'}
          </button>
          <button className="btn btn--ghost btn--block" onClick={() => dispatch(clearCart())}>
            Clear cart
          </button>
        </aside>
      </div>
    </div>
  );
}

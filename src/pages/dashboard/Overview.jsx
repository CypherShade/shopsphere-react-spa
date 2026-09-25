import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { selectCartCount } from '../../store/cartSlice';
import { selectOrders } from '../../store/ordersSlice';
import { selectWishlist } from '../../store/wishlistSlice';
import { formatPrice } from '../../utils/format';

export default function Overview() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const orders = useSelector(selectOrders);
  const wishlist = useSelector(selectWishlist);
  const cartCount = useSelector(selectCartCount);

  const spent = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);

  const stats = [
    { label: 'Orders placed', value: orders.length, to: '/dashboard/orders' },
    { label: 'Total spent', value: formatPrice(spent), to: '/dashboard/orders' },
    { label: 'Wishlist', value: wishlist.length, to: '/dashboard/wishlist' },
    { label: 'In cart', value: cartCount, to: '/cart' },
  ];

  return (
    <div className="stack">
      <h1>Hi, {user.name} 👋</h1>
      <div className="stats">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card stat">
            <span className="muted small">{s.label}</span>
            <strong>{s.value}</strong>
          </Link>
        ))}
      </div>
      <div className="card pad">
        <h2 className="h3">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="muted">No orders yet. <Link to="/products">Find something you like →</Link></p>
        ) : (
          <ul className="list">
            {orders.slice(0, 3).map((o) => (
              <li key={o.id} className="row row--between">
                <span><strong>{o.id}</strong> · {new Date(o.createdAt).toLocaleDateString()}</span>
                <span>{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

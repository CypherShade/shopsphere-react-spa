import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectOrders } from '../../store/ordersSlice';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatPrice } from '../../utils/format';
import StateBox from '../../components/ui/StateBox';

export default function Orders() {
  useDocumentTitle('Orders');
  const orders = useSelector(selectOrders);
  const { state } = useLocation();

  if (orders.length === 0) {
    return (
      <StateBox title="No orders yet" action={<Link to="/products" className="btn btn--primary">Browse products</Link>}>
        Orders you place from the cart appear here.
      </StateBox>
    );
  }

  return (
    <div className="stack">
      <h1>Orders</h1>
      {state?.justOrdered && <p className="notice notice--ok" role="status">Order placed successfully. Thank you!</p>}
      {orders.map((o) => (
        <details key={o.id} className="card pad order" open={o === orders[0] && state?.justOrdered}>
          <summary className="row row--between">
            <span>
              <strong>{o.id}</strong> <span className="muted">· {new Date(o.createdAt).toLocaleString()}</span>
            </span>
            <span className="row">
              <span className="badge badge--ok">{o.status}</span>
              <strong>{formatPrice(o.total)}</strong>
            </span>
          </summary>
          <ul className="list">
            {o.items.map((i) => (
              <li key={i.id} className="row row--between">
                <Link to={`/products/${i.id}`}>{i.title}</Link>
                <span className="muted">× {i.qty}</span>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

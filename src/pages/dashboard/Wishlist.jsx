import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWishlist } from '../../store/wishlistSlice';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import ProductGrid from '../../components/ui/ProductGrid';
import StateBox from '../../components/ui/StateBox';

export default function Wishlist() {
  useDocumentTitle('Wishlist');
  const items = useSelector(selectWishlist);

  return (
    <div className="stack">
      <h1>Wishlist</h1>
      {items.length === 0 ? (
        <StateBox title="Your wishlist is empty" action={<Link to="/products" className="btn btn--primary">Discover products</Link>}>
          Tap the heart on any product to save it here.
        </StateBox>
      ) : (
        <ProductGrid products={items} eager={false} />
      )}
    </div>
  );
}

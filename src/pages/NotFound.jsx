import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import StateBox from '../components/ui/StateBox';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const { pathname } = useLocation();
  return (
    <div className="container page">
      <StateBox title="404 · Page not found" action={<Link to="/" className="btn btn--primary">Back home</Link>}>
        Nothing lives at <code>{pathname}</code>.
      </StateBox>
    </div>
  );
}

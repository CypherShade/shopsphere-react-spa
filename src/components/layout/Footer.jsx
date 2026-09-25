import { memo } from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          © {new Date().getFullYear()} ShopSphere · Built with React 18, Redux Toolkit & React Router 6
        </p>
        <nav aria-label="Footer" className="row">
          <Link to="/products">Catalog</Link>
          <Link to="/dashboard/performance">Web Vitals</Link>
          <a href="https://dummyjson.com" target="_blank" rel="noreferrer">
            Data: DummyJSON
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default memo(Footer);

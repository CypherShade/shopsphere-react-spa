import { memo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartCount } from '../../store/cartSlice';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CartIcon, MoonIcon, SunIcon, UserIcon } from '../ui/Icons';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
];

function Navbar() {
  const count = useSelector(selectCartCount);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu on navigation (derived during render, no effect needed)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="logo" aria-label="ShopSphere home">
          <span className="logo__mark" aria-hidden="true" />
          ShopSphere
        </Link>

        <button
          className="icon-btn navbar__burger"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="main-nav" className={`navbar__nav ${open ? 'is-open' : ''}`} aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="navbar__link">
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/dashboard" className="navbar__link">
            Dashboard
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link to="/cart" className="icon-btn cart-btn" aria-label={`Cart, ${count} items`}>
            <CartIcon />
            {count > 0 && <span className="cart-btn__count">{count > 99 ? '99+' : count}</span>}
          </Link>
          {user ? (
            <div className="navbar__user">
              <Link to="/dashboard" className="avatar" title={user.name} aria-label="Open dashboard">
                {user.name[0]}
              </Link>
              <button className="btn btn--ghost btn--sm" onClick={logout}>
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn--primary btn--sm">
              <UserIcon width={16} height={16} /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default memo(Navbar);

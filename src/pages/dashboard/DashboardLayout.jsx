import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';

const tabs = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/orders', label: 'Orders' },
  { to: '/dashboard/wishlist', label: 'Wishlist' },
  { to: '/dashboard/performance', label: 'Performance' },
  { to: '/dashboard/settings', label: 'Settings' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="container page dashboard">
      <aside className="dashboard__side">
        <div className="dashboard__user">
          <span className="avatar avatar--lg" aria-hidden="true">{user.name[0]}</span>
          <div>
            <strong>{user.name}</strong>
            <p className="muted small">{user.email}</p>
          </div>
        </div>
        <nav className="dashboard__nav" aria-label="Dashboard">
          {tabs.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end}>
              {t.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn btn--ghost btn--block" onClick={logout}>
          Log out
        </button>
      </aside>
      <section className="dashboard__content">
        {/* Nested Suspense: only the panel shows a fallback, the sidebar stays put */}
        <Suspense fallback={<Skeleton height={320} radius={16} />}>
          <Outlet />
        </Suspense>
      </section>
    </div>
  );
}

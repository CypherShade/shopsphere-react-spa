import { Suspense } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorBoundary from '../ui/ErrorBoundary';
import { PageSkeleton } from '../ui/Skeleton';

export default function RootLayout() {
  const { pathname } = useLocation();
  const navigation = useNavigation();

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {navigation.state !== 'idle' && <div className="route-progress" aria-hidden="true" />}
      <Navbar />
      <main id="main" className="main">
        {/* Route change resets the boundary so one broken page doesn't stick */}
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}

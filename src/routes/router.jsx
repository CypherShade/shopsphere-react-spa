import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import RouteError from '../components/ui/RouteError';
import Home from '../pages/Home';
import { GuestOnly, RequireAuth } from './guards';
import { catalogUrl, endpoints, parseCatalogParams, topRatedUrl } from '../api/client';
import { prefetch } from '../hooks/useFetch';

// Non-blocking loaders: they kick off the data request the moment navigation starts, so the
// API call runs in parallel with the lazy page chunk download instead of after it (no waterfall).
// They return null immediately and the page reads the same request through useFetch's cache.
const prefetchLoader = (toUrl) => (args) => {
  prefetch(toUrl(args));
  return null;
};

// Route-level code splitting: each page is its own chunk, downloaded on first visit.
// Home stays in the main bundle because it is the landing (LCP) route.
const Products = lazy(() => import('../pages/Products'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Categories = lazy(() => import('../pages/Categories'));
const CategoryProducts = lazy(() => import('../pages/CategoryProducts'));
const Cart = lazy(() => import('../pages/Cart'));
const Login = lazy(() => import('../pages/Login'));
const NotFound = lazy(() => import('../pages/NotFound'));
const DashboardLayout = lazy(() => import('../pages/dashboard/DashboardLayout'));
const Overview = lazy(() => import('../pages/dashboard/Overview'));
const Orders = lazy(() => import('../pages/dashboard/Orders'));
const Wishlist = lazy(() => import('../pages/dashboard/Wishlist'));
const Settings = lazy(() => import('../pages/dashboard/Settings'));
const Performance = lazy(() => import('../pages/dashboard/Performance'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home />, loader: prefetchLoader(() => topRatedUrl) },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <Products />,
            loader: prefetchLoader(({ request }) => catalogUrl(parseCatalogParams(new URL(request.url).searchParams))),
          },
          {
            path: ':productId', // dynamic URL parameter
            element: <ProductDetail />,
            loader: prefetchLoader(({ params }) => endpoints.product(params.productId)),
          },
        ],
      },
      {
        path: 'categories',
        children: [
          { index: true, element: <Categories />, loader: prefetchLoader(() => endpoints.categories()) },
          { path: ':slug', element: <CategoryProducts /> }, // dynamic + infinite scroll
        ],
      },
      { path: 'cart', element: <Cart /> },

      // Guest-only guard
      { element: <GuestOnly />, children: [{ path: 'login', element: <Login /> }] },

      // Protected, nested dashboard routes
      {
        element: <RequireAuth />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <Overview /> },
              { path: 'orders', element: <Orders /> },
              { path: 'wishlist', element: <Wishlist /> },
              { path: 'settings', element: <Settings /> },
              { path: 'performance', element: <Performance /> },
              { path: '*', element: <Navigate to="/dashboard" replace /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

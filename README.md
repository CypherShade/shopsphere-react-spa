# ShopSphere: Advanced React SPA

DigiHust Frontend Internship, **Assignment 3 (Days 11–15)**: Complex React UI Engineering, State Optimization & Performance Metrics.

ShopSphere is a product catalog and storefront. It uses live data from the public [DummyJSON](https://dummyjson.com) REST API and demonstrates:

- global state with Redux Toolkit and the Context API
- custom hooks
- nested and guarded routing with React Router 6
- loading skeletons, pagination and infinite scroll
- error boundaries
- code splitting, memoisation and Core Web Vitals tuning, measured with Lighthouse

## Tech stack

| Concern | Choice |
| --- | --- |
| UI | React 18 (function components and hooks) |
| Build | Vite 6 (ES modules, Rollup chunking) |
| Routing | React Router 6.30 (`createBrowserRouter` data router) |
| Global state | Redux Toolkit 2 (cart, wishlist, orders) and Context API (auth, theme) |
| Metrics | `web-vitals` 6 (LCP, CLS, INP, FCP, TTFB) |
| Styling | Plain CSS with custom properties (light and dark themes), no UI framework |

## Getting started

```bash
npm install
cp .env.example .env      # optional: defaults are built in
npm run dev               # http://localhost:5173
npm run build             # production build -> dist/
npm run preview           # serve the production build on http://localhost:4173
```

**Demo login:** username `demo`, password `demo1234`. Any username of 3+ characters with a password of 6+ characters also works, because auth is simulated.

### Environment variables (`.env.example`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `https://dummyjson.com` | Base URL of the product API |
| `VITE_PAGE_SIZE` | `12` | Products per catalog page |

## Requirement coverage

### 1. Architecture & state management

- **Redux Toolkit** (`src/store`): `cartSlice`, `wishlistSlice` and `ordersSlice`.
  - Entities are stored keyed by id, so updates are O(1).
  - Memoised `createSelector` selectors compute cart totals and counts.
  - A `prepare` callback keeps the order reducer pure.
  - The store is persisted to `localStorage`, batched with `requestIdleCallback`.
- **Context API** (`src/context`): `AuthContext` (user, login, logout, profile) and `ThemeContext` (light/dark).
  - Provider values are wrapped in `useMemo` so consumers re-render only on real changes.

#### Custom hooks (`src/hooks`)

| Hook | Responsibility |
| --- | --- |
| `useFetch(url, { keepPrevious })` | Data fetching with a 5-minute in-memory cache, in-flight request de-duplication, stale-response protection, `refetch()`, and a `prefetch()` helper |
| `useDebounce(value, delay)` | Delays fast-changing values (search inputs) |
| `useLocalStorage(key, init)` | `useState` that persists to `localStorage` and syncs across tabs |
| `useInfiniteScroll(fetchPage, resetKey)` | Infinite loading with an `IntersectionObserver` sentinel, `AbortController` cancellation, and reset on source change |
| `useWebVitals()` | Live Core Web Vitals through `useSyncExternalStore` |
| `useDocumentTitle(title)` | Per-route document titles |

### 2. Routing & dynamic rendering

| Path | Page | Notes |
| --- | --- | --- |
| `/` | Home | Eager (landing / LCP route) |
| `/products?q=&sort=&page=` | Catalog | Debounced search, sort and pagination, all stored in the URL |
| `/products/:productId` | Product detail | Dynamic parameter, 404 state, related products |
| `/categories` | Category list | Client-side filter |
| `/categories/:slug` | Category products | Dynamic parameter, **infinite scroll** |
| `/cart` | Cart | Checkout requires login |
| `/login` | Login | `GuestOnly` guard |
| `/dashboard/*` | Dashboard | `RequireAuth` guard, **nested routes**: overview, orders, wishlist, performance, settings |
| `*` | 404 | |

- **Navigation guards:**
  - `RequireAuth` redirects to `/login` and remembers the location the user was trying to reach.
  - `GuestOnly` keeps signed-in users out of `/login`.
  - `useBlocker` and `beforeunload` guard unsaved changes on the Settings page.
- **Visual states:** skeletons with the same dimensions as the real content, pagination, infinite scroll, empty and error states with retry, and a top progress bar during navigation.
- **Fallback UI:** a route-level `errorElement`, which also detects failed lazy-loaded chunks after a deploy. An `ErrorBoundary` wraps the outlet and resets on route change. A live crash demo is at `/dashboard/performance`.

### 3. Performance engineering

- **Code splitting:**
  - 13 routes use `React.lazy` with nested `Suspense` boundaries.
  - Vendor code is split into `react`, `router`, `redux` and `vendor` chunks for long-term caching.
- **No request waterfall:** route `loader`s start API requests while the lazy chunk downloads. The page then reuses the same in-flight request through `useFetch`.
- **Memoisation:**
  - `React.memo` wraps `ProductCard`, `ProductGrid`, `CartRow`, `Navbar`, `Footer`, `Pagination`, `Rating` and `SmartImage`.
  - `useMemo` handles derived lists; `useCallback` keeps handlers stable for memoised children.
- **Images (`SmartImage`):**
  - CDN WebP images with explicit `width` and `height`, plus an `aspect-ratio` container, so there is no layout shift.
  - `loading="lazy"` and `decoding="async"` below the fold.
  - `fetchpriority="high"` on the LCP image.
- **Network:** `preconnect` to the API and image CDN. List requests use `select=` to trim payload fields.
- **CLS:**
  - The theme is applied before first paint.
  - The app uses a system font stack, so no web font loads and swaps.
  - Skeletons have fixed dimensions.

### Lighthouse (mobile, simulated throttling, median of 3 runs)

"Before" is the same app built with the optimisations removed: no lazy routes, no `React.memo`, no vendor chunks, no preconnect, eager images without dimensions, full API payloads, and a text loader instead of skeletons.

| Page | Metric | Before | After |
| --- | --- | --- | --- |
| `/products` | Performance score | 76 | **96** |
| `/products` | CLS | 0.522 | **0** |
| `/products` | Total Blocking Time | 34 ms | **4 ms** |
| `/products` | Unused JavaScript | 40 KiB | **0 KiB** |
| `/products` | Transfer size | 188 KiB | **145 KiB** |
| `/` | Performance score | 100 | 99 |
| `/` | Unused JavaScript | 42 KiB | **0 KiB** |

See the PDF report for the full analysis, including trade-offs such as extra chunk requests on HTTP/1.1.

## Project structure

```
src/
├── api/client.js            # endpoints, URL builders, fetchJSON
├── store/                   # Redux Toolkit slices and store (persisted)
├── context/                 # AuthContext, ThemeContext
├── hooks/                   # custom hooks
├── routes/                  # router (lazy routes, loaders), guards
├── components/
│   ├── layout/              # RootLayout, Navbar, Footer
│   └── ui/                  # ProductCard, ProductGrid, SmartImage, Skeleton, Pagination, ErrorBoundary, ...
├── pages/                   # route pages (+ dashboard/ nested pages)
├── utils/                   # formatters, web-vitals collector
└── styles/global.css
```

## Deployment

The repository includes SPA rewrite configs for both hosts:

- **Vercel:** import the repo. Framework preset is *Vite*, build command `npm run build`, output directory `dist`. `vercel.json` rewrites all paths to `index.html`.
- **Netlify:** `netlify.toml` sets the same build command and a `/*` redirect to `/index.html`.

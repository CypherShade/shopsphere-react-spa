import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

/** Router-level fallback (errorElement) for loader, lazy-import and render failures */
export default function RouteError() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Unexpected error';
  const message = isRouteErrorResponse(error) ? error.data : error?.message;
  // A failed lazy chunk usually means a new deploy - a reload fetches the fresh bundle
  const chunkError = /dynamically imported module|Loading chunk/i.test(message || '');

  return (
    <div className="container page">
      <div className="state-box" role="alert">
        <h1>{title}</h1>
        <p className="muted">{chunkError ? 'A new version of the app is available.' : message}</p>
        <div className="row">
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload
          </button>
          <Link className="btn btn--ghost" to="/">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

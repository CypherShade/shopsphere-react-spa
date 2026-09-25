import { useCallback, useEffect, useReducer, useRef } from 'react';
import { fetchJSON } from '../api/client';

// Module-level response cache shared by every component
const cache = new Map();
// In-flight requests, so a prefetch and a component asking for the same URL share one request
const inflight = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getFresh(url) {
  const hit = url && cache.get(url);
  return hit && Date.now() - hit.time < CACHE_TTL ? hit.data : undefined;
}

/** De-duplicated request: concurrent callers for the same URL get the same promise */
function request(url) {
  if (inflight.has(url)) return inflight.get(url);
  const promise = fetchJSON(url)
    .then((data) => {
      cache.set(url, { data, time: Date.now() });
      return data;
    })
    .finally(() => inflight.delete(url));
  inflight.set(url, promise);
  return promise;
}

function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { data: action.keep ? state.data : undefined, error: null, loading: true };
    case 'success':
      return { data: action.data, error: null, loading: false };
    case 'error':
      return { ...state, error: action.error, loading: false };
    case 'idle':
      return { data: undefined, error: null, loading: false };
    default:
      return state;
  }
}

/**
 * Declarative data fetching with an in-memory cache, request de-duplication
 * and race-condition safety.
 * @param {string|null} url - pass null to skip the request
 * @param {{ keepPrevious?: boolean }} options - keep old data visible while the next URL loads
 */
export function useFetch(url, { keepPrevious = false } = {}) {
  const [state, dispatch] = useReducer(reducer, url, (u) => {
    const cached = getFresh(u);
    return { data: cached, error: null, loading: Boolean(u) && cached === undefined };
  });
  const [reloadToken, reload] = useReducer((n) => n + 1, 0);
  const forceNetwork = useRef(false);

  useEffect(() => {
    if (!url) {
      dispatch({ type: 'idle' });
      return undefined;
    }
    if (forceNetwork.current) {
      forceNetwork.current = false;
      cache.delete(url);
    }
    const cached = getFresh(url);
    if (cached !== undefined) {
      dispatch({ type: 'success', data: cached });
      return undefined;
    }

    // `ignore` guards against races: a slow response for an old URL can never
    // overwrite the state for the current one.
    let ignore = false;
    dispatch({ type: 'start', keep: keepPrevious });
    request(url).then(
      (data) => !ignore && dispatch({ type: 'success', data }),
      (error) => !ignore && dispatch({ type: 'error', error })
    );
    return () => {
      ignore = true;
    };
  }, [url, reloadToken, keepPrevious]);

  const refetch = useCallback(() => {
    forceNetwork.current = true;
    reload();
  }, []);

  return { ...state, refetch };
}

/**
 * Start a request ahead of time (route loaders, card hover) and warm the cache.
 * Components that mount later with the same URL reuse the in-flight promise.
 */
export function prefetch(url) {
  if (getFresh(url) !== undefined) return;
  request(url).catch(() => {});
}

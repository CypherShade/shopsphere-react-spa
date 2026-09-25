import { useSyncExternalStore } from 'react';
import { getVitals, subscribeVitals } from '../utils/webVitals';

/** Live Core Web Vitals collected during the current session */
export function useWebVitals() {
  return useSyncExternalStore(subscribeVitals, getVitals);
}

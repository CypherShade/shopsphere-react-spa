import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

let vitals = {};
const listeners = new Set();

function record(metric) {
  vitals = { ...vitals, [metric.name]: { value: metric.value, rating: metric.rating } };
  listeners.forEach((notify) => notify());
  if (import.meta.env.DEV) {
    console.info(`[web-vitals] ${metric.name}`, Math.round(metric.value * 1000) / 1000, metric.rating);
  }
}

export function startWebVitals() {
  const opts = { reportAllChanges: true };
  onLCP(record, opts);
  onCLS(record, opts);
  onINP(record, opts);
  onFCP(record, opts);
  onTTFB(record, opts);
}

export const getVitals = () => vitals;

export function subscribeVitals(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

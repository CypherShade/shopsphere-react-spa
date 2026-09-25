import { useCallback, useEffect, useRef, useState } from 'react';

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Drop-in replacement for useState that persists to localStorage
 * and stays in sync across browser tabs.
 */
export function useLocalStorage(key, initialValue) {
  const initialRef = useRef(initialValue);
  const [value, setValue] = useState(() =>
    read(key, typeof initialValue === 'function' ? initialValue() : initialValue)
  );

  useEffect(() => {
    try {
      if (value === undefined || value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: keep the in-memory state */
    }
  }, [key, value]);

  // Cross-tab synchronisation via the `storage` event
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key) return;
      const init = initialRef.current;
      const fallback = typeof init === 'function' ? init() : init;
      try {
        setValue(e.newValue === null ? fallback : JSON.parse(e.newValue));
      } catch {
        setValue(fallback);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const remove = useCallback(() => setValue(null), []);

  return [value, setValue, remove];
}

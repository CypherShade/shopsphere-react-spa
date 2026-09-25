import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import ordersReducer from './ordersSlice';

const STORAGE_KEY = 'ss-store';
const PERSISTED = ['cart', 'wishlist', 'orders'];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
  },
  preloadedState: loadState(),
});

// Persist slices, batched to one write per idle period instead of per dispatch
let scheduled = false;
store.subscribe(() => {
  if (scheduled) return;
  scheduled = true;
  const save = () => {
    scheduled = false;
    const state = store.getState();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Object.fromEntries(PERSISTED.map((k) => [k, state[k]])))
      );
    } catch {
      /* ignore quota errors */
    }
  };
  (window.requestIdleCallback || ((cb) => setTimeout(cb, 200)))(save);
});

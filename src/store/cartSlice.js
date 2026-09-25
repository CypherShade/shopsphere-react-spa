import { createSelector, createSlice } from '@reduxjs/toolkit';
import { discounted } from '../utils/format';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: {} }, // keyed by product id for O(1) updates
  reducers: {
    addToCart(state, { payload: product }) {
      const existing = state.items[product.id];
      if (existing) {
        existing.qty = Math.min(existing.qty + 1, product.stock ?? 99);
      } else {
        state.items[product.id] = {
          id: product.id,
          title: product.title,
          price: product.price,
          discountPercentage: product.discountPercentage ?? 0,
          thumbnail: product.thumbnail,
          stock: product.stock ?? 99,
          qty: 1,
        };
      }
    },
    updateQty(state, { payload: { id, qty } }) {
      const item = state.items[id];
      if (!item) return;
      if (qty <= 0) delete state.items[id];
      else item.qty = Math.min(qty, item.stock);
    },
    removeFromCart(state, { payload: id }) {
      delete state.items[id];
    },
    clearCart(state) {
      state.items = {};
    },
  },
});

export const { addToCart, updateQty, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// Memoized selectors: derived data is only recomputed when cart.items changes
const selectCartMap = (state) => state.cart.items;

export const selectCartItems = createSelector([selectCartMap], (map) => Object.values(map));

export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, i) => sum + i.qty, 0)
);

export const selectCartTotals = createSelector([selectCartItems], (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = items.reduce((sum, i) => sum + discounted(i.price, i.discountPercentage) * i.qty, 0);
  return { subtotal, savings: subtotal - total, total };
});

export const selectQtyInCart = (id) => (state) => state.cart.items[id]?.qty ?? 0;

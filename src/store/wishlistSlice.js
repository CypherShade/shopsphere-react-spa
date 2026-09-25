import { createSelector, createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: {} },
  reducers: {
    toggleWishlist(state, { payload: product }) {
      if (state.items[product.id]) {
        delete state.items[product.id];
      } else {
        const { id, title, price, thumbnail, rating, category, discountPercentage, stock } = product;
        state.items[id] = { id, title, price, thumbnail, rating, category, discountPercentage, stock };
      }
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

export const selectWishlist = createSelector([(state) => state.wishlist.items], (map) =>
  Object.values(map)
);
export const selectIsWishlisted = (id) => (state) => Boolean(state.wishlist.items[id]);

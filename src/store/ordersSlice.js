import { createSlice, nanoid } from '@reduxjs/toolkit';

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { list: [] },
  reducers: {
    placeOrder: {
      reducer(state, { payload }) {
        state.list.unshift(payload);
      },
      // prepare() keeps the reducer pure: ids and timestamps are generated here
      prepare({ items, total }) {
        return {
          payload: {
            id: `ORD-${nanoid(6).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            items: items.map(({ id, title, qty, price }) => ({ id, title, qty, price })),
            total,
            status: 'Processing',
          },
        };
      },
    },
  },
});

export const { placeOrder } = ordersSlice.actions;
export default ordersSlice.reducer;

export const selectOrders = (state) => state.orders.list;

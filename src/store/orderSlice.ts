import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

export interface OrderItem {
  product: string;
  name: string;
  qty: number;
  image: string;
  price: number;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string; 
  orderItems: OrderItem[];
  shippingAddress: {
    firstName: string;   // 🚀 Added to match schema persistence
    lastName: string;    // 🚀 Added to match schema persistence
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;       // 🚀 Added to match schema persistence
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice?: number; 
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;      
  isDelivered: boolean;
  deliveredAt?: string;  
  createdAt: string;    
  isUserLocked: boolean; 
}

interface OrderState {
  orders: Order[]; 
  loading: boolean; 
  error: string | null; 
}

// ASYNC ACTIONS EXECUTORS
export const listOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  "orders/list",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/orders");
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to fetch orders");
    }
  },
);

export const listMyOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  "orders/listMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/orders/myorders");
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to fetch your orders");
    }
  },
);

export const deliverOrder = createAsyncThunk<Order, string, { rejectValue: string }>(
  "orders/deliver",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await API.put(`/orders/${id}/deliver`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to deliver order");
    }
  },
);

export const createOrder = createAsyncThunk<Order, Partial<Order>, { rejectValue: string }>(
  "orders/create",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await API.post("/orders", orderData);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to place order");
    }
  },
);

export const deleteOrder = createAsyncThunk<string, string, { rejectValue: string }>(
  "orders/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await API.delete(`/orders/${id}`);
      return id; 
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to cancel order");
    }
  },
);

// 🔒 TOGGLE LOCK THUNK ACTION
export const toggleOrderLockAction = createAsyncThunk<Order, string, { rejectValue: string }>(
  "orders/toggleLock",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await API.put(`/orders/${id}/toggle-lock`);
      return response.data; 
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to mutate storage block configurations");
    }
  }
);

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(listOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      })

      .addCase(listMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload; 
      })
      .addCase(listMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      })

      .addCase(deliverOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })

      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })

      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter((order) => order._id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      })

      .addCase(toggleOrderLockAction.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload; 
        }
      });
  },
});

export default orderSlice.reducer;
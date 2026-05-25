import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './adminSlice';
import authReducer from './authSlice'
import productReducer from './productSlice';
import orderReducer from './orderSlice'
import userReducer from './userSlice'

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    products: productReducer,
    orders: orderReducer,
    users: userReducer
  },
});

// Ye dono lines lazmi 'export' honi chahiye
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
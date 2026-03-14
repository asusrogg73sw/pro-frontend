import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './adminSlice';
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,    
  },
});

// Ye dono lines lazmi 'export' honi chahiye
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
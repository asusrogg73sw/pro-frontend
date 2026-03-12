import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
  },
});

// Ye dono lines lazmi 'export' honi chahiye
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
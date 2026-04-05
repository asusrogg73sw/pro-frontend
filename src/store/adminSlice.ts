// src/store/adminSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

// ✅ Async thunk
export const fetchStats = createAsyncThunk('admin/fetchStats', async () => {
  const response = await API.get('/admin/stats');
  return response.data;
});

// ✅ Initial state type (optional but better for TS)
interface AdminState {
  stats: any;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  loading: false,
  error: null,
};

// ✅ Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // 🔄 Reset state
    resetAdminState: (state) => {
      state.stats = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null; // 👈 clear old error
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

// ✅ Exports
export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;
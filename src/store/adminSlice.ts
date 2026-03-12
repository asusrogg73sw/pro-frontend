import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

export const fetchStats = createAsyncThunk('admin/fetchStats', async () => {
  const response = await API.get('/admin/stats');
  return response.data;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: { stats: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => { state.loading = true; })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as any;
      });
  },
});

export default adminSlice.reducer;
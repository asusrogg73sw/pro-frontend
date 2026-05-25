// src/store/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

// 1. Fetch All Users (Admin Only)
export const listUsers = createAsyncThunk(
  "users/list",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/users");
      return response.data; // Users ka array
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

// 2. Delete User (Admin Only)
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await API.delete(`/users/${id}`);
      return id; // Return ID taake state se filter ho sake
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user",
      );
    }
  },
);

// 3. Toggle Admin Role (Admin Only)
export const toggleAdminRole = createAsyncThunk(
  "users/toggleAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await API.put(`/users/${id}/toggle-admin`);
      return response.data; // Updated user object
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user role",
      );
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // List Users
      .addCase(listUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(listUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u: any) => u._id !== action.payload);
      })
      // Toggle Admin Role
      .addCase(toggleAdminRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u: any) => u._id === action.payload._id,
        );
        if (index !== -1) {
          state.users[index] = action.payload; // Live status update
        }
      });
  },
});

export default userSlice.reducer;

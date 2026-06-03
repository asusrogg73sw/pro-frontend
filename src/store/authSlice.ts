import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// FIX: Imported using 'import type' to respect verbatimModuleSyntax
import type { PayloadAction } from "@reduxjs/toolkit";
import API from "../api/axios";
import { initializeCart } from "./cartSlice"; // Cart ko sync karne ke liye import kiya

interface AddressState {
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

interface UserInfo {
  _id?: string;
  name: string;
  email: string;
  shippingAddress?: AddressState;
  isAdmin?: boolean;
  token?: string;
  // FIX: Replaced 'any' with 'unknown' to pass strict eslint rules
  [key: string]: unknown;
}

interface AuthState {
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password?: string;
  [key: string]: unknown;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  age?: number;
  [key: string]: unknown;
}

// 1. Login Action
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.post("/users/login", userData);
      localStorage.setItem("userInfo", JSON.stringify(response.data));
      
      // Login hotey hi naye user ki ID ke sath cart initialize karo
      dispatch(initializeCart(response.data._id));
      
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

// NEW FIX: Register Action (Sign Up Flow)
export const registerUserAction = createAsyncThunk(
  "auth/register",
  async (userData: RegisterCredentials, { dispatch, rejectWithValue }) => {
    try {
      // Backend routes ke mutabiq POST /api/users register ke liye hai
      const response = await API.post("/users", userData);
      localStorage.setItem("userInfo", JSON.stringify(response.data));
      
      // Registration ke sath hi user specific cart active kar do
      dispatch(initializeCart(response.data._id));
      
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  },
);

// 2. Logout Action
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await API.post("/users/logout");
      localStorage.removeItem("userInfo");
      
      // Logout par cart ko default guest ya empty state par reset karo
      dispatch(initializeCart(undefined));
    } catch { 
      return rejectWithValue("Logout failed");
    }
  },
);

const initialState: AuthState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")!)
    : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login flow
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register flow
      .addCase(registerUserAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserAction.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(registerUserAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout flow
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.error = null;
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
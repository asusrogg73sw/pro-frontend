import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

/* =========================================================
   1. Fetch All Products
   ========================================================= */
export const listProducts = createAsyncThunk(
  "products/list",
  async (_, { rejectWithValue }) => {
    try {
      // Backend se tamam products fetch kar rahe hain
      const response = await API.get("/products");

      // Products return honge
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);

/* =========================================================
   2. Create Product
   ========================================================= */
export const createProduct = createAsyncThunk(
  "products/create",
  async (productData: any, { rejectWithValue }) => {
    try {
      // Naya product create kar rahe hain
      const response = await API.post("/products", productData);

      // Created product return hoga
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product",
      );
    }
  },
);

/* =========================================================
   3. Delete Product
   ========================================================= */
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      // Product delete kar rahe hain
      await API.delete(`/products/${id}`);

      // Sirf ID return karenge taake state se remove kar saken
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  },
);

/* =========================================================
   4. Fetch Single Product Details
   ========================================================= */
export const getProductDetails = createAsyncThunk(
  "products/details",
  async (id: string, { rejectWithValue }) => {
    try {
      // Single product ki details fetch kar rahe hain
      const response = await API.get(`/products/${id}`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product details",
      );
    }
  },
);

/* =========================================================
   5. Update Product
   ========================================================= */
export const updateProductAction = createAsyncThunk(
  "products/update",
  async (
    {
      id,
      productData,
    }: {
      id: string;
      productData: any;
    },
    { rejectWithValue },
  ) => {
    try {
      // Product update kar rahe hain
      const response = await API.put(`/products/${id}`, productData);

      // Updated product return hoga
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product",
      );
    }
  },
);

/* =========================================================
   Initial State
   ========================================================= */
const initialState = {
  products: [],
  loading: false,
  error: null as string | null,

  // Single product details store karne ke liye
  productDetails: null as any,
};

/* =========================================================
   Product Slice
   ========================================================= */
const productSlice = createSlice({
  name: "products",
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* =====================================================
         LIST PRODUCTS
         ===================================================== */
      .addCase(listProducts.pending, (state) => {
        // Loading start
        state.loading = true;
        state.error = null;
      })

      .addCase(listProducts.fulfilled, (state, action) => {
        // Loading stop
        state.loading = false;

        // Products state mein save kar rahe hain
        state.products = action.payload.products;
      })

      .addCase(listProducts.rejected, (state, action) => {
        // Error handle
        state.loading = false;
        state.error = action.payload as string;
      })

      /* =====================================================
         CREATE PRODUCT
         ===================================================== */
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })

      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;

        // Naya product array ke start mein add kar rahe hain
        state.products = [action.payload, ...state.products];
      })

      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* =====================================================
         DELETE PRODUCT
         ===================================================== */
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;

        // Deleted product ko state se remove kar rahe hain
        state.products = state.products.filter(
          (p: any) => p._id !== action.payload,
        );
      })

      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* =====================================================
         GET SINGLE PRODUCT DETAILS
         ===================================================== */
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;

        // Single product details save kar rahe hain
        state.productDetails = action.payload;
      })

      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* =====================================================
         UPDATE PRODUCT
         ===================================================== */
      .addCase(updateProductAction.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateProductAction.fulfilled, (state, action) => {
        state.loading = false;

        // Products array mein us product ka index dhoond rahe hain
        const index = state.products.findIndex(
          (p: any) => p._id === action.payload._id,
        );

        // Agar product mil gaya to usko updated data se replace kar do
        if (index !== -1) {
          state.products[index] = action.payload;
        }

        // Single product details bhi update kar do
        state.productDetails = action.payload;
      })

      .addCase(updateProductAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productSlice.reducer;

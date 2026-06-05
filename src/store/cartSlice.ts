import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Cart ke single item ka structure
export interface CartItem {
  product: string; // Product ki unique ID (MongoDB ID)
  name: string; // Product ka naam
  image: string; // Product ki image ka URL
  price: number; // Product ki qeemat
  countInStock: number; // Stock mein kitne items bache hain
  qty: number; // User ne kitne quantity select ki hai
}

// Cart state ka main structure
interface CartState {
  cartItems: CartItem[]; 
}

const getCartKey = (): string => {
  try {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser && parsedUser._id) {
        return `cartItems_${parsedUser._id}`;
      }
    }
  } catch (error) {
    console.error("Error parsing userInfo from localStorage", error);
  }
  return "cartItems_guest";
};

// LocalStorage se safe data parsing
const loadCartFromStorage = (): CartItem[] => {
  try {
    const key = getCartKey();
    const storedCart = localStorage.getItem(key);
    return storedCart ? (JSON.parse(storedCart) as CartItem[]) : [];
  } catch (error) {
    console.error("Failed to parse cart items from localStorage", error);
    return [];
  }
};

const initialState: CartState = {
  cartItems: loadCartFromStorage(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Login/Logout par cart data user ke mutabiq switch karne ke liye
    initializeCart: (state) => {
      state.cartItems = loadCartFromStorage();
    },

    // 1. Cart mein item add ya update karne ka function
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product ? item : x
        );
      } else {
        state.cartItems.push(item);
      }

      localStorage.setItem(getCartKey(), JSON.stringify(state.cartItems));
    },

    // 2. Cart se item delete karne ka function
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.product !== action.payload
      );

      localStorage.setItem(getCartKey(), JSON.stringify(state.cartItems));
    },

    // 3. Poora cart khali karne ka function
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem(getCartKey());
    },
  },
});

export const { initializeCart, addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";

import { store } from "./store";
import "./index.css";
import App from "./App.tsx";

// Pages
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
// 🚀 NEW FIX: Register page component ko import list me shamil kiya
import RegisterPage from "./pages/RegisterPage.tsx"; 
import ProductListPage from "./pages/ProductListPage.tsx";
import AddProductPage from "./pages/AddProductPage.tsx";
import EditProductPage from "./pages/EditProductPage.tsx";
import OrderListPage from "./pages/OrderListPage.tsx";
import UserListPage from "./pages/UserListPage.tsx";
import OrderPaymentPage from "./pages/OrderPaymentPage.tsx";
import CartPage from "./pages/CartPage.tsx";
import MyOrdersPage from "./pages/MyOrdersPage.tsx";
// 🚀 NEW FIX: Naye Profile component page ko import list me inject kiya
import ProfilePage from "./pages/ProfilePage.tsx";

import AdminDashboardPage from "./pages/AdminDashboardPage.tsx";

// Middlewares / Route Guards
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminRoute from "./components/AdminRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // 🌍 1. Public Routes
      {
        path: "/", 
        element: <HomePage />, 
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      // 🚀 NEW FIX: Naye customer registration flow ke liye route inject kiya
      {
        path: "/register",
        element: <RegisterPage />,
      },
      { 
        path: "/cart", 
        element: <CartPage /> 
      },

      // 🔐 2. Customer/User Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/my-orders", element: <MyOrdersPage /> }, 
          // 🚀 NEW FIX: Profile management route dashboard map table me secure ki
          { path: "/profile", element: <ProfilePage /> }, 
          { path: "/order-pay/:id", element: <OrderPaymentPage /> },
        ],
      },

      // 👑 3. Admin Only Routes
      {
        element: <AdminRoute />,
        children: [
          {
            path: "/admin/dashboard", 
            element: <AdminDashboardPage />, 
          },
          {
            path: "/admin/products",
            element: <ProductListPage />,
          },
          {
            path: "/admin/orders", 
            element: <OrderListPage />, 
          },
          {
            path: "/admin/products/add",
            element: <AddProductPage />,
          },
          {
            path: "/admin/products/edit/:id",
            element: <EditProductPage />,
          },
          { 
            path: "/admin/users", 
            element: <UserListPage /> 
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
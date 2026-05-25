// main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";

import { store } from "./store";

import "./index.css";

import App from "./App.tsx";

import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProductListPage from "./pages/ProductListPage.tsx";
import AddProductPage from "./pages/AddProductPage.tsx";
import EditProductPage from "./pages/EditProductPage.tsx";
import OrderListPage from "./pages/OrderListPage.tsx";

import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminRoute from "./components/AdminRoute";

import UserListPage from "./pages/UserListPage.tsx";

// Router setup
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // =====================================================
      // Public Routes
      // =====================================================

      {
        path: "/login",
        element: <LoginPage />,
      },

      {
        path: "/products",
        element: <ProductListPage />,
      },

      // =====================================================
      // Protected Routes (Logged-in Users)
      // =====================================================

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },

          {
            path: "/orders",
            element: <OrderListPage />,
          },
        ],
      },

      // =====================================================
      // Admin Routes
      // =====================================================

      {
        element: <AdminRoute />,
        children: [
          {
            path: "/products/add",
            element: <AddProductPage />,
          },

          {
            path: "/products/edit/:id",
            element: <EditProductPage />,
          },
          { path: "/users", element: <UserListPage /> },
        ],
      },
    ],
  },
]);

// Render App
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);

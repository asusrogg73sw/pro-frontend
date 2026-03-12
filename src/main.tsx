// main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux"; // Redux provider import
import { store } from "./store"; // Redux store import
import "./index.css";
import App from "./App.tsx";
import HomePage from "./pages/HomePage.tsx";

// Router setup
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <h1 className="text-3xl font-bold">Login Page</h1>,
      },
    ],
  },
]);

// Rendering the app with Redux Provider wrapping RouterProvider
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
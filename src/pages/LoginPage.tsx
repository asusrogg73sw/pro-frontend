// src/pages/LoginPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link import kiya
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, clearError } from "../store/authSlice";
import { resetAdminState } from "../store/adminSlice";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { userInfo, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      dispatch(resetAdminState()); // clear old admin (403) errors
      navigate("/");
    }

    return () => {
      dispatch(clearError()); // cleanup old auth errors
    };
  }, [userInfo, navigate, dispatch]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form
        onSubmit={submitHandler}
        className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Account Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 text-sm mb-2">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 mb-4"
        >
          {loading ? "Authenticating..." : "Login Now"}
        </button>

        {/* 👇 Added Register Link Option */}
        <div className="text-center text-sm text-gray-500">
          New Customer?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register Here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
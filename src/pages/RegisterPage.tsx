// src/pages/RegisterPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUserAction, clearError } from "../store/authSlice";
import { resetAdminState } from "../store/adminSlice";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { userInfo, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      dispatch(resetAdminState());
      navigate("/");
    }

    return () => {
      dispatch(clearError());
    };
  }, [userInfo, navigate, dispatch]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Password validation check
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match!");
      return;
    }

    dispatch(
      registerUserAction({
        name,
        email,
        password,
        age: age ? Number(age) : undefined,
      })
    );
  };

  return (
    <div className="flex justify-center items-center h-[90vh]">
      <form
        onSubmit={submitHandler}
        className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Account
        </h2>

        {(error || validationError) && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error || validationError}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-2">Full Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-2">Email Address</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-2">Age (Optional)</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="24"
            value={age}
            onChange={(e) => setAge(e.target.value !== "" ? Number(e.target.value) : "")}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-2">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 text-sm mb-2">Confirm Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 mb-4"
        >
          {loading ? "Registering..." : "Register Now"}
        </button>

        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
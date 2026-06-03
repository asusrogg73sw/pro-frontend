import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks"; 
import { setCredentials } from "../store/authSlice"; 
import API from "../api/axios";
import { User, Mail, Lock, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";

interface AddressState {
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

const ProfilePage = () => {
  const dispatch = useAppDispatch(); 
  const { userInfo } = useAppSelector((state) => state.auth);

  // Core Account Inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Integrated Shipping Address State
  const [addressData, setAddressData] = useState<AddressState>({
    country: "Pakistan",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  // UI States
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state data safely when component mounts or userInfo shifts
  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || "");
      setEmail(userInfo.email || "");
      
      if (userInfo.shippingAddress) {
        setAddressData({
          country: userInfo.shippingAddress.country || "Pakistan",
          firstName: userInfo.shippingAddress.firstName || "",
          lastName: userInfo.shippingAddress.lastName || "",
          address: userInfo.shippingAddress.address || "",
          city: userInfo.shippingAddress.city || "",
          postalCode: userInfo.shippingAddress.postalCode || "",
          phone: userInfo.shippingAddress.phone || "",
        });
      }
    }
  }, [userInfo]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match matching criteria.");
      return;
    }

    try {
      setLoading(true);
      
      const payload: {
        name: string;
        email: string;
        password?: string;
        shippingAddress: AddressState;
      } = { 
        name, 
        email,
        shippingAddress: addressData 
      };

      if (password) {
        payload.password = password;
      }

      // Hit endpoint to save onto MongoDB
      const { data } = await API.put("/users/profile", payload);

      // Trigger global state sync directly
      dispatch(setCredentials({ ...data }));

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errorBridge = err as { response?: { data?: { message?: string } } };
      setMessage(errorBridge.response?.data?.message || "Something went wrong updating profiles.");
    } finally {
      // FIX: Wrapped short-circuit in a proper conditional block to satisfy eslint no-unused-expressions
      if (loading) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 min-h-screen bg-gray-50/30">
      
      {/* Dynamic Feedback Overlays */}
      {message && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl font-semibold text-sm animate-fadeIn">
          {message}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          <span>Profile Parameters & Logistics Rules Updated Successfully! ✨</span>
        </div>
      )}

      {/* Page Title Bar */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Account Parameters</h2>
        <p className="text-xs text-gray-400 mt-1 font-medium font-mono uppercase tracking-wider">Configure client metrics & dispatch routing</p>
      </div>

      <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* ==================== LEFT COLUMN: IDENTITY PARAMETERS (5/12) ==================== */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Identity Details</h3>
          </div>

          {/* Username Control Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500">Profile Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Username"
                className="w-full bg-gray-50/50 focus:bg-white border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email Vector Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500">Email Vector</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-gray-50/50 focus:bg-white border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Access Phrase - New Password */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-gray-500">New Access Phrase</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to maintain asset"
                className="w-full bg-gray-50/50 focus:bg-white border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Confirm Access Phrase Validation Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500">Confirm Access Phrase</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-gray-50/50 focus:bg-white border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: SHIPPING LOGISTICS MANAGEMENT (7/12) ==================== */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <MapPin size={18} className="text-blue-600" />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Default Logistics Terminal</h3>
          </div>

          {/* Country Selection Context */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500">Country / Region</label>
            <select
              value={addressData.country}
              onChange={(e) => setAddressData({ ...addressData, country: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            >
              <option value="Pakistan">Pakistan 🇵🇰</option>
              <option value="United States">United States 🇺🇸</option>
              <option value="United Kingdom">United Kingdom 🇬🇧</option>
            </select>
          </div>

          {/* First Name & Last Name Split Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">First Name</label>
              <input
                type="text"
                value={addressData.firstName}
                onChange={(e) => setAddressData({ ...addressData, firstName: e.target.value })}
                placeholder="First name"
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Last Name</label>
              <input
                type="text"
                value={addressData.lastName}
                onChange={(e) => setAddressData({ ...addressData, lastName: e.target.value })}
                placeholder="Last name"
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Physical Address Input Block */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500">Physical Address</label>
            <input
              type="text"
              value={addressData.address}
              onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
              placeholder="Apartment, suite, unit, street address, area layout..."
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* City and Postal Code Multi-Column Layer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">City Target</label>
              <input
                type="text"
                value={addressData.city}
                onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                placeholder="City"
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Postal Code</label>
              <input
                type="text"
                value={addressData.postalCode}
                onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                placeholder="Postal code"
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Native Phone Prefix and Numeric Field Option */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500">Contact Protocol (Phone)</label>
            <div className="relative flex rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <div className="flex items-center gap-1.5 px-3 border-r border-gray-200 bg-gray-100 text-xs font-bold text-gray-600 select-none">
                <span>🇵🇰</span>
                <span>+92</span>
              </div>
              <input
                type="tel"
                value={addressData.phone}
                onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                placeholder="3001234567"
                className="w-full bg-transparent text-gray-800 px-4 py-3 text-sm font-medium outline-none"
              />
            </div>
          </div>

          {/* Action Call Controls and Security Tags */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <ShieldCheck size={14} className="text-blue-500" />
              <span>Data modifications are synced safely across operations.</span>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3.5 px-8 rounded-xl transition-all shadow-xs disabled:opacity-50 tracking-wide cursor-pointer"
            >
              {loading ? "Saving Matrices..." : "Save Configuration Changes"}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};

export default ProfilePage;
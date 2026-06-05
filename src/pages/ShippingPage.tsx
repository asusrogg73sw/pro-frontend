import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createOrder } from "../store/orderSlice";
import API from "../api/axios"; 
import { ChevronRight, MapPin, Truck, ShoppingBag, Loader2 } from "lucide-react";
import type { CartItem } from "../store/cartSlice";

interface ShippingAddressState {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

const ShippingPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const { userInfo } = useAppSelector((state) => state.auth);

  const [isRedirectingToPay, setIsRedirectingToPay] = useState(false);
  const [fetchingActiveOrder, setFetchingActiveOrder] = useState(false);

  const savedAddress = (userInfo?.shippingAddress as ShippingAddressState) || {};

  // Local state form fields matching reactive structures
  const [firstName, setFirstName] = useState(savedAddress.firstName || "");
  const [lastName, setLastName] = useState(savedAddress.lastName || "");
  const [address, setAddress] = useState(savedAddress.address || "");
  const [city, setCity] = useState(savedAddress.city || "");
  const [postalCode, setPostalCode] = useState(savedAddress.postalCode || "");
  const [country] = useState(savedAddress.country || "Pakistan");
  const [phone, setPhone] = useState(savedAddress.phone || "");

  // Auth aur Cart data routing guard protection
  useEffect(() => {
    if (!userInfo) {
      navigate("/login?redirect=/shipping");
      return;
    }
    
    if (!isRedirectingToPay && cartItems.length === 0) {
      navigate("/cart");
      return;
    }
  }, [userInfo, cartItems.length, navigate, isRedirectingToPay]);

  // Operational order sync tracking parameters hook (Faida sirf checkout data recover karne ke liye)
  useEffect(() => {
    const activeOrderId = localStorage.getItem("activeProcessingOrderId");
    
    if (activeOrderId && userInfo) {
      const fetchCurrentOrderShipping = async () => {
        try {
          setFetchingActiveOrder(true);
          const { data } = await API.get(`/orders/${activeOrderId}`);
          if (data && data.shippingAddress && !data.isPaid) { // ✅ Only sync if order is UNPAID
            setFirstName((prev) => prev === "" ? (data.shippingAddress.firstName || savedAddress.firstName || "") : prev);
            setLastName((prev) => prev === "" ? (data.shippingAddress.lastName || savedAddress.lastName || "") : prev);
            setAddress((prev) => prev === "" ? (data.shippingAddress.address || savedAddress.address || "") : prev);
            setCity((prev) => prev === "" ? (data.shippingAddress.city || savedAddress.city || "") : prev);
            setPostalCode((prev) => prev === "" ? (data.shippingAddress.postalCode || savedAddress.postalCode || "") : prev);
            setPhone((prev) => prev === "" ? (data.shippingAddress.phone || savedAddress.phone || "") : prev);
          } else if (data && data.isPaid) {
            // ✅ SAFETY PATCH: If the tracked order is already paid, destroy the reference from memory instantly
            localStorage.removeItem("activeProcessingOrderId");
          }
        } catch (err) {
          console.error("Failed to recover operational order context mapping:", err);
          localStorage.removeItem("activeProcessingOrderId"); // Clean up broken traces on error
        } finally {
          setFetchingActiveOrder(false);
        }
      };

      fetchCurrentOrderShipping();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]); 

  // Strict Floating-Point Calculations
  const itemsPrice = Number(cartItems.reduce((acc: number, item: CartItem) => acc + item.price * item.qty, 0).toFixed(2));
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 10;
  
  // Dynamic Calculation according to 15% backend logic mapping
  const calculatedTax = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + calculatedTax + shippingPrice).toFixed(2));

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim() || !city.trim() || !postalCode.trim() || !phone.trim() || !firstName.trim() || !lastName.trim()) {
      alert("Please enter full parameters across all shipping records.");
      return;
    }

    // ✅ FIX: Forcefully create a new order context every single time on form submission to prevent dirty tracking
    const orderData = {
      orderItems: cartItems.map(({ product, name, qty, image, price }) => ({
        product,
        name,
        qty,
        image,
        price: Number(price.toFixed(2)),
      })),
      shippingAddress: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim() || "Pakistan",
        phone: phone.trim(),
      },
      paymentMethod: "Stripe",
      itemsPrice,
      taxPrice: calculatedTax, 
      shippingPrice,
      totalPrice,
    };

    try {
      setIsRedirectingToPay(true);
      
      // Clear any outdated trace just before writing the fresh instance
      localStorage.removeItem("activeProcessingOrderId");

      const newOrder = await dispatch(createOrder(orderData)).unwrap();
      
      // Store the true new dynamic context instance
      localStorage.setItem("activeProcessingOrderId", newOrder._id);
      navigate(`/order-pay/${newOrder._id}`);
    } catch (err) {
      setIsRedirectingToPay(false);
      alert("Failed to establish order context: " + err);
    }
  };

  if (fetchingActiveOrder) {
    return (
      <div className="text-center py-24 text-gray-500 font-medium tracking-wide animate-pulse flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span>Synchronizing current checkout tracking data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-12 min-h-screen bg-gray-50/50">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8 tracking-wide uppercase select-none">
        <Link to="/cart" className="hover:text-blue-600 transition">Cart</Link> 
        <ChevronRight size={12} />
        <span className="text-gray-900 font-bold">Shipping Information</span> 
        <ChevronRight size={12} />
        <span className="cursor-not-allowed">Secure Gateway Checkout</span>
      </div>

      <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <MapPin size={18} className="text-blue-600" />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Logistics Dispatch Terminal</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">First Name</label>
              <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Last Name</label>
              <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500">Physical Delivery Address</label>
            <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Apartment, suite, street address, sector area..." className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">City Target</label>
              <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Karachi" className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Postal Code</label>
              <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="e.g. 75500" className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Country / Region</label>
              <input type="text" required disabled value={country} className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 text-sm font-bold cursor-not-allowed select-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Contact Phone Number</label>
              <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 03001234567" className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <button type="submit" disabled={isRedirectingToPay} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
            <Truck size={16} /> {isRedirectingToPay ? "Processing Secure Credentials..." : "Save & Proceed to Secure Gateway Payment"}
          </button>
        </div>

        <div className="lg:col-span-5 bg-gray-100/40 border border-gray-200/50 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200/60">
            <ShoppingBag size={20} className="text-gray-700" />
            <h3 className="text-base font-bold text-gray-800 tracking-tight">Purchase Summary Overview</h3>
          </div>

          <div className="divide-y divide-gray-200/60 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-gray-200 bg-white" />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Qty: {item.qty} &bull; ${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-800">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-xs border-t border-gray-200/60 pt-4">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Items Subtotal</span>
              <span className="font-bold text-gray-800">${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Logistics Distribution</span>
              <span className={`font-bold ${shippingPrice === 0 ? "text-emerald-600 uppercase text-[10px]" : "text-gray-800"}`}>
                {shippingPrice === 0 ? "Free Shipping" : `$${shippingPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-900 pt-3 border-t border-dashed border-gray-200 font-bold text-sm">
              <span>Total Bill Amount</span>
              <span className="text-lg font-black">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShippingPage;
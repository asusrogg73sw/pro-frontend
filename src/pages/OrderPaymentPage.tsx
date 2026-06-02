import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import API from "../api/axios"; 
import { Package, MapPin, ChevronRight, CheckCircle2 } from "lucide-react"; 

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "../components/CheckoutForm";

// Stripe Publishable Key Setup
const stripePromise = loadStripe("pk_test_51R5zJMRrJPw2wOndAzU0oSkCwYoOZVNLeXb2G5mFdbpA5RY0CAui80KtijZrCYXnh2mne08XnrEupVZ6cNWgAd8D00SPrIKjp7");

interface OrderItem {
  product: string;
  name: string;
  qty: number;
  image: string;
  price: number;
}

interface OrderDetails {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
}

const OrderPaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { userInfo } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 Memoized using useCallback so it can be safely passed to child components
  const fetchOrderDetails = useCallback(async () => {
    try {
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data);
      setError(null);
    } catch (err) {
      const errorBridge = err as { response?: { data?: { message?: string } } };
      setError(errorBridge.response?.data?.message || "Failed to sync order details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    fetchOrderDetails();
  }, [userInfo, navigate, fetchOrderDetails]); // Clean dependencies

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-400 font-medium tracking-wide animate-pulse">
        Synchronizing checkout protocols... 📦
      </div>
    );
  }
  
  if (error) return <div className="text-center py-24 text-red-500 font-semibold">{error}</div>;
  if (!order) return <div className="text-center py-24 text-gray-500">Order context missing.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-2 min-h-screen">
      
      {/* Breadcrumb Steps Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4 tracking-wide uppercase">
        <span>Cart</span> <ChevronRight size={12} />
        <span>Shipping</span> <ChevronRight size={12} />
        <span className="text-blue-600">Secure Payment Gateway</span>
      </div>

      <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-2 tracking-tight">
        <Package className="text-blue-600" size={32} />
        Review & Pay Order
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Container Layout - 7/12 */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Target Address Info Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                <MapPin size={18} className="text-blue-500" /> Delivery Target
              </h3>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${order.isDelivered ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                {order.isDelivered ? "Dispatched" : "Pending Dispatch"}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
          </div>

          {/* Cart Items Summary Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-800 border-b pb-3 uppercase tracking-wider">Order Items</h3>
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-sm bg-gray-50" />
                    <div>
                      <h4 className="text-sm font-black text-gray-800 truncate max-w-50 md:max-w-sm">{item.name}</h4>
                      <p className="text-xs text-gray-400 font-bold mt-0.5">Quantity: {item.qty} &bull; ${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-gray-800">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Billing Panel - 5/12 */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-6">
            
            <div>
              <h3 className="text-lg font-black text-gray-900">Summary & Billing</h3>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5 tracking-tight">Ref: {order._id}</p>
            </div>

            {/* Price Calculations Output */}
            <div className="space-y-3 text-sm text-gray-600 border-b border-gray-100 pb-5">
              <div className="flex justify-between font-medium">
                <span>Items Subtotal:</span>
                <span className="font-bold text-gray-800">${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Tax Allocation (15%):</span>
                <span className="font-bold text-gray-800">${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Freight Logistics:</span>
                <span className="font-bold text-emerald-600">{order.shippingPrice === 0 ? "FREE SHIPPING" : `$${order.shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-black text-lg text-gray-900 pt-3 border-t border-dashed border-gray-200">
                <span>Total Due:</span>
                <span className="text-xl text-blue-600">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Paid vs Unpaid Conditional Rendering */}
            {order.isPaid ? (
              <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-3 shadow-inner">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto animate-pulse" />
                <div>
                  <p className="text-base font-black">Order Fully Paid!</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Paid on {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : "Recent"} &bull; Stripe Verified
                  </p>
                </div>
                <button 
                  onClick={() => navigate("/my-orders")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm"
                >
                  Go to My Orders
                </button>
              </div>
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  orderId={order._id}
                  totalPrice={order.totalPrice}
                  customerEmail={userInfo?.email || "customer@example.com"}
                  onSuccess={fetchOrderDetails}
                />
              </Elements>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderPaymentPage;
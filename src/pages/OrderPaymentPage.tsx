import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; 
import { useAppSelector, useAppDispatch } from "../store/hooks";
import API from "../api/axios"; 
import { ChevronRight, CheckCircle2, CreditCard, Truck, Loader2 } from "lucide-react"; 

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "../components/CheckoutForm";
import { clearCart } from "../store/cartSlice";

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
    firstName?: string;
    lastName?: string;
    name?: string; // ✅ Back-compatibility fallback parameter layer flag
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
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
  const dispatch = useAppDispatch();

  const { userInfo } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
    
  const [activeMethod, setActiveMethod] = useState<"stripe" | "cod">("stripe");
  const [codLoading, setCodLoading] = useState<boolean>(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
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
  }, [userInfo, navigate, fetchOrderDetails]);

  useEffect(() => {
    if (id) {
      localStorage.setItem("activeProcessingOrderId", id);
    }
  }, [id]);

  const handleCODPayment = async () => {
    setCodLoading(true);
    try {
      await API.put(`/orders/${id}/pay`, {
        id: `COD-${Date.now()}`,
        status: "COD_Pending",
        email: userInfo?.email,
      });
      
      localStorage.removeItem("activeProcessingOrderId");
      dispatch(clearCart());
      await fetchOrderDetails();
    } catch (err) {
      const errorBridge = err as { response?: { data?: { message?: string } } };
      alert(errorBridge.response?.data?.message || "Logistics configuration failed.");
    } finally {
      setCodLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-500 font-medium tracking-wide animate-pulse flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span>Synchronizing secure checkout system... 📦</span>
      </div>
    );
  }
  
  if (error) return <div className="text-center py-24 text-red-500 font-semibold">{error}</div>;
  if (!order) return <div className="text-center py-24 text-gray-500">Order context missing.</div>;

  // ✅ ROBUST MAPPING RESOLVER: Fixes the 'Customer Profile Name Missing' bug across variations
  const orderFirstName = order.shippingAddress?.firstName?.trim() || "";
  const orderLastName = order.shippingAddress?.lastName?.trim() || "";
  const orderDirectName = order.shippingAddress?.name?.trim() || "";

  const receiverName = (orderFirstName || orderLastName)
    ? `${orderFirstName} ${orderLastName}`.trim()
    : orderDirectName || userInfo?.name || "Customer Profile Name Missing";

  const displayAddress = order.shippingAddress?.address || "";
  const displayCity = order.shippingAddress?.city || "";
  const displayPostalCode = order.shippingAddress?.postalCode || "";
  const displayCountry = order.shippingAddress?.country || "";
  const displayPhone = order.shippingAddress?.phone || "";

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-12 min-h-screen bg-gray-50/50">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8 tracking-wide uppercase select-none">
        <Link to="/cart" className="hover:text-blue-600 transition-colors">Cart</Link> 
        <ChevronRight size={12} />
        <Link to="/shipping" className="hover:text-blue-600 transition-colors">Shipping Information</Link> 
        <ChevronRight size={12} />
        <span className="text-gray-900 font-bold">Secure Gateway Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Delivery Target Destination</h3>
            <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <p className="text-sm font-bold text-gray-800 capitalize tracking-wide">{receiverName}</p>
              <p className="text-sm text-gray-500 leading-relaxed font-normal">
                {displayAddress || "No physical address provided yet"}
                {displayCity && `, ${displayCity}`}
                {displayPostalCode && `, ${displayPostalCode}`}
                {displayCountry && `, ${displayCountry}`}
              </p>
              {displayPhone && (
                <p className="text-sm font-semibold text-blue-600 pt-1">
                  <span className="text-gray-400 font-normal text-xs">Contact phone: </span>{displayPhone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Payment Protocols</h3>
            <p className="text-xs text-gray-400 -mt-2 font-medium">All financial events are encrypted and fully protected.</p>
            
            {order.isPaid ? (
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 text-emerald-900 p-8 rounded-2xl text-center space-y-4 shadow-xs">
                <CheckCircle2 size={44} className="text-emerald-500 mx-auto" />
                <div>
                  <h4 className="text-lg font-black tracking-tight">Transaction Complete!</h4>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Verified Secure via Gateway Infrastructure &bull; {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : "Processed"}
                  </p>
                </div>
                <button 
                  onClick={() => navigate("/my-orders")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Return to Dashboard Orders
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="grid grid-cols-2 border-b border-gray-100 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => setActiveMethod("stripe")}
                    className={`flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${activeMethod === "stripe" ? "bg-white border-blue-600 text-blue-600 shadow-xs" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                  >
                    <CreditCard size={16} />
                    Stripe Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMethod("cod")}
                    className={`flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${activeMethod === "cod" ? "bg-white border-blue-600 text-blue-600 shadow-xs" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                  >
                    <Truck size={16} />
                    Cash on Delivery
                  </button>
                </div>

                <div className="p-6 bg-white">
                  {activeMethod === "stripe" ? (
                    <div className="animate-fadeIn">
                      <Elements stripe={stripePromise}>
                        <CheckoutForm
                          orderId={order._id}
                          totalPrice={order.totalPrice}
                          customerEmail={userInfo?.email || "customer@example.com"}
                          receiverName={receiverName} 
                          onSuccess={fetchOrderDetails}
                        />
                      </Elements>
                    </div>
                  ) : (
                    <div className="space-y-5 animate-fadeIn py-2">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                        <Truck className="text-blue-500 mt-0.5 shrink-0" size={18} />
                        <div>
                          <p className="text-sm font-bold text-gray-800">Pay inside domestic parameters</p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                            Logistics agents will collect the exact cash total of <span className="font-bold text-gray-700">${order.totalPrice.toFixed(2)}</span> right at your doorstep during delivery execution.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={codLoading}
                        onClick={handleCODPayment}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 components-trigger-btn"
                      >
                        {codLoading ? "Processing order state..." : "Confirm Cash On Delivery Order"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Purchase Summary Module */}
        <div className="lg:col-span-5 bg-gray-100/40 border border-gray-200/50 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200/60">
            <h3 className="text-base font-bold text-gray-800 tracking-tight">Purchase Items</h3>
          </div>
          <div className="divide-y divide-gray-200/60 max-h-60 overflow-y-auto pr-1">
            {order.orderItems.map((item, idx) => (
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
              <span className="font-bold text-gray-800">${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Shipping Fee</span>
              <span className="font-bold text-gray-800">${order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-900 pt-3 border-t border-dashed border-gray-200 font-bold text-sm">
              <span>Total Bill Amount</span>
              <span className="text-lg font-black">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderPaymentPage;
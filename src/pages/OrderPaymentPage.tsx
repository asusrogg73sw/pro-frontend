import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import API from "../api/axios"; 
import { ChevronRight, CheckCircle2, CreditCard, Truck, ShieldCheck, ShoppingBag } from "lucide-react"; 

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "../components/CheckoutForm";

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

  const { userInfo } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
    
  const [activeMethod, setActiveMethod] = useState<"stripe" | "cod">("stripe");
  const [codLoading, setCodLoading] = useState<boolean>(false);

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
  }, [userInfo, navigate, fetchOrderDetails]);

  const handleCODPayment = async () => {
    setCodLoading(true);
    try {
      // FIX: Payload structure aligned perfectly for updated backend expectations
      const updatedAddress = userInfo?.shippingAddress ? {
        firstName: userInfo.shippingAddress.firstName || order?.shippingAddress?.firstName,
        lastName: userInfo.shippingAddress.lastName || order?.shippingAddress?.lastName,
        address: userInfo.shippingAddress.address,
        city: userInfo.shippingAddress.city,
        postalCode: userInfo.shippingAddress.postalCode,
        country: userInfo.shippingAddress.country,
        phone: userInfo.shippingAddress.phone || order?.shippingAddress?.phone
      } : order?.shippingAddress;

      await API.put(`/orders/${id}/pay`, {
        id: `COD-${Date.now()}`,
        status: "COD_Pending",
        email: userInfo?.email,
        shippingAddress: updatedAddress
      });
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
      <div className="text-center py-24 text-gray-500 font-medium tracking-wide animate-pulse">
        Synchronizing secure checkout system... 📦
      </div>
    );
  }
  
  if (error) return <div className="text-center py-24 text-red-500 font-semibold">{error}</div>;
  if (!order) return <div className="text-center py-24 text-gray-500">Order context missing.</div>;

  // FIX: Safe nested fallback names checking
  const receiverName = userInfo?.shippingAddress?.firstName 
    ? `${userInfo.shippingAddress.firstName} ${userInfo.shippingAddress?.lastName || ""}`.trim()
    : order.shippingAddress?.firstName 
      ? `${order.shippingAddress.firstName} ${order.shippingAddress?.lastName || ""}`.trim()
      : userInfo?.name || "Customer Account";

  // FIX: Accessing fields from nested shippingAddress key inside userInfo slice safely
  const displayAddress = userInfo?.shippingAddress?.address || order.shippingAddress.address;
  const displayCity = userInfo?.shippingAddress?.city || order.shippingAddress.city;
  const displayPostalCode = userInfo?.shippingAddress?.postalCode || order.shippingAddress.postalCode;
  const displayCountry = userInfo?.shippingAddress?.country || order.shippingAddress.country;
  const displayPhone = userInfo?.shippingAddress?.phone || order.shippingAddress.phone;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-12 min-h-screen bg-gray-50/50">
      
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8 tracking-wide uppercase">
        <span>Cart</span> <ChevronRight size={12} />
        <span>Shipping Information</span> <ChevronRight size={12} />
        <span className="text-gray-900 font-bold">Secure Gateway Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* ==================== LEFT PANEL ==================== */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Delivery Target Destination</h3>
            <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <p className="text-sm font-bold text-gray-800">{receiverName}</p>
              
              <p className="text-sm text-gray-500 leading-relaxed font-normal">
                {displayAddress}, {displayCity},{" "}
                {displayPostalCode}, {displayCountry}
              </p>
              
              {displayPhone && (
                <p className="text-xs font-mono text-gray-400 pt-1">Contact: {displayPhone}</p>
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
                        className="w-full bg-gray-900 hover:bg-black text-white text-sm font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {codLoading ? "Authorizing Order Parameters..." : `Complete Order ($${order.totalPrice.toFixed(2)})`}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* ==================== RIGHT PANEL ==================== */}
        <div className="lg:col-span-5 bg-gray-100/40 border border-gray-200/50 rounded-2xl p-6 md:p-8 space-y-8 lg:sticky lg:top-8">
          
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200/60">
            <ShoppingBag size={20} className="text-gray-700" />
            <h3 className="text-base font-bold text-gray-800 tracking-tight">Purchase Summary Overview</h3>
          </div>

          <div className="divide-y divide-gray-200/60 max-h-64 overflow-y-auto pr-2 space-y-1">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-xs bg-white" />
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-xs">
                      {item.qty}
                    </span>
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-gray-800 truncate">{item.name}</h4>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">${item.price.toFixed(2)} unit valuation</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-800 shrink-0">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3.5 text-sm border-t border-gray-200/60 pt-6">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Items Subtotal</span>
              <span className="font-bold text-gray-800">${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Tax Evaluation (15%)</span>
              <span className="font-bold text-gray-800">${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Logistics Distribution</span>
              <span className={`font-bold ${order.shippingPrice === 0 ? "text-emerald-600 uppercase text-xs tracking-wider" : "text-gray-800"}`}>
                {order.shippingPrice === 0 ? "Free Shipping" : `$${order.shippingPrice.toFixed(2)}`}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-gray-900 pt-4 border-t border-dashed border-gray-200">
              <span className="font-bold text-base tracking-tight">Total Amount Due</span>
              <div className="text-right">
                <span className="text-2xl font-black font-mono tracking-tighter text-gray-900">${order.totalPrice.toFixed(2)}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Calculated in USD</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium border-t border-gray-200/40">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>End-to-End Advanced SSL Protection</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderPaymentPage;
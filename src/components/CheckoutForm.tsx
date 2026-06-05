import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import type { StripeCardNumberElementChangeEvent, StripeCardExpiryElementChangeEvent } from "@stripe/stripe-js";
import { CreditCard, ShieldCheck, Lock, Loader2 } from "lucide-react";
import API from "../api/axios";
import { useAppDispatch } from "../store/hooks";
import { clearCart } from "../store/cartSlice";

interface CheckoutFormProps {
  orderId: string;
  totalPrice: number;
  customerEmail: string;
  receiverName: string;
  onSuccess: () => Promise<void>;
}

interface AxiosErrorStructure {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  orderId,
  totalPrice,
  customerEmail,
  receiverName,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const isMounted = useRef(true);
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [cardNumberDisplay, setCardNumberDisplay] = useState("•••• •••• •••• ••••");
  const [cardExpiryDisplay, setCardExpiryDisplay] = useState("MM/YY");
  const [cardBrand, setCardBrand] = useState("unknown");

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const elementOptions = {
    style: {
      base: {
        fontSize: "15px",
        color: "#1f2937",
        fontFamily: "monospace, sans-serif",
        "::placeholder": { color: "#9ca3af" },
      },
      invalid: { color: "#ef4444" },
    },
  };

  const handleCardNumberChange = (event: StripeCardNumberElementChangeEvent) => {
    if (event.brand) {
      setCardBrand(event.brand);
    }
    
    // Safe cast access logic configuration
    const rawEvent = event as any;
    if (event.complete && rawEvent.last4) {
      setCardNumberDisplay(`•••• •••• •••• ${rawEvent.last4}`);
    } else {
      setCardNumberDisplay("•••• •••• •••• ••••");
    }
  };

  const handleExpiryChange = (event: StripeCardExpiryElementChangeEvent) => {
    // ✅ UX ENHANCEMENT: Instead of flashing a harsh string "VALID", we subtly update color/text styling or keep cleanly reactive placeholders
    if (event.complete) {
      setCardExpiryDisplay("READY");
    } else {
      setCardExpiryDisplay("MM/YY");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || paying) return;

    try {
      setPaying(true);
      setErrorMessage(null);

      const { data } = await API.post("/payment/process", { orderId });
      const clientSecret = data.client_secret;

      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        if (isMounted.current) setPaying(false);
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { 
            email: customerEmail,
            name: receiverName || "Anonymous Customer" 
          },
        },
      });

      if (result.error) {
        if (isMounted.current) {
          setErrorMessage(result.error.message || "Payment Declined.");
          setPaying(false);
        }
      } else if (result.paymentIntent?.status === "succeeded") {
        await API.put(`/orders/${orderId}/pay`, {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
        });

        localStorage.removeItem("activeProcessingOrderId");
        dispatch(clearCart());

        await onSuccess();
        if (isMounted.current) {
          navigate("/my-orders");
        }
      }
    } catch (err) {
      const errorBridge = err as AxiosErrorStructure;
      if (isMounted.current) {
        setErrorMessage(errorBridge.response?.data?.message || "Internal transaction error occurred.");
        setPaying(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Visual Credit Card Frame Preview */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-900 via-indigo-950 to-blue-900 h-48 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between transform transition duration-300 border border-white/10 select-none">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-300">Secure Gateway</p>
            <div className="w-10 h-8 bg-amber-400/20 backdrop-blur-md border border-amber-400/30 rounded-lg flex items-center justify-center">
              <div className="w-7 h-5 bg-amber-400/50 rounded-sm opacity-80"></div>
            </div>
          </div>
          {cardBrand === "visa" ? (
            <span className="text-xl font-black italic text-white tracking-tight animate-fadeIn">VISA</span>
          ) : cardBrand === "mastercard" ? (
            <span className="text-xl font-black italic text-red-400 tracking-tight animate-fadeIn">MasterCard</span>
          ) : (
            <CreditCard size={26} className="text-blue-300 opacity-80" />
          )}
        </div>

        <div className="font-mono text-xl tracking-[0.25em] text-center text-slate-100 py-2">
          {cardNumberDisplay}
        </div>

        <div className="flex justify-between items-end">
          <div className="max-w-[70%] truncate">
            <p className="text-[9px] uppercase font-mono text-slate-400 tracking-wider">Card Holder</p>
            <p className="text-xs font-bold font-mono tracking-wide truncate uppercase">
              {receiverName?.trim() ? receiverName : "Customer Profile Name Missing"}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] uppercase font-mono text-slate-400 tracking-wider">Expires</p>
            <p className={`text-xs font-bold font-mono tracking-wide ${cardExpiryDisplay === "READY" ? "text-emerald-400 font-extrabold" : ""}`}>
              {cardExpiryDisplay}
            </p>
          </div>
        </div>
      </div>

      {/* Stripe Input Forms Container */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-600 block">Card Number</label>
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-blue-500 focus-within:bg-white shadow-inner transition">
            <CardNumberElement options={elementOptions} onChange={handleCardNumberChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 block">Expiration Date</label>
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-blue-500 focus-within:bg-white shadow-inner transition">
              <CardExpiryElement options={elementOptions} onChange={handleExpiryChange} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 block">CVC Security</label>
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-blue-500 focus-within:bg-white shadow-inner transition">
              <CardCvcElement options={elementOptions} />
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl font-medium border border-red-100 animate-fadeIn">
          ❌ {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md hover:shadow-xl transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        {paying ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Verifying Transaction...
          </>
        ) : (
          <>
            <Lock size={16} />
            Pay Securely (${totalPrice.toFixed(2)})
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-gray-400 text-[11px] font-medium pt-1">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>AES-256 Bit Encrypted Connection via Stripe Engine</span>
      </div>
    </form>
  );
};

export default CheckoutForm;
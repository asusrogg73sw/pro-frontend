import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router-dom";
import { addToCart, removeFromCart } from "../store/cartSlice";
import type { CartItem } from "../store/cartSlice";

const CartPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const { userInfo } = useAppSelector((state) => state.auth);

  // Math Calculations with Strict Floating-Point Precision
  const itemsPrice = cartItems.reduce(
    (acc: number, item: CartItem) => acc + item.price * item.qty,
    0
  );
  
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 10;
  const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

  const decreaseQtyHandler = (item: CartItem) => {
    if (item.qty > 1) {
      dispatch(addToCart({ ...item, qty: item.qty - 1 }));
    }
  };

  const increaseQtyHandler = (item: CartItem) => {
    if (item.qty < item.countInStock) {
      dispatch(addToCart({ ...item, qty: item.qty + 1 }));
    }
  };

  const checkoutHandler = () => {
    if (cartItems.length === 0) return;
    
    if (!userInfo) {
      navigate("/login?redirect=/shipping");
    } else {
      navigate("/shipping");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-medium">
          Your cart is empty! 🛒
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item: CartItem) => (
              <div
                key={item.product}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition"
              >
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" />

                <div className="flex-1 ml-4">
                  <h4 className="font-bold text-gray-800 text-base">{item.name}</h4>
                  <p className="text-sm text-blue-600 font-semibold">${item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden mx-4">
                  <button 
                    onClick={() => decreaseQtyHandler(item)} 
                    disabled={item.qty <= 1} 
                    className="px-3 py-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    —
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-x border-gray-100 min-w-10 text-center select-none">
                    {item.qty}
                  </span>
                  <button 
                    onClick={() => increaseQtyHandler(item)} 
                    disabled={item.qty >= item.countInStock} 
                    className="px-3 py-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <div className="text-sm font-bold text-gray-800 min-w-17.5 text-right mr-4">
                  ${(item.price * item.qty).toFixed(2)}
                </div>

                <button 
                  onClick={() => dispatch(removeFromCart(item.product))} 
                  className="text-gray-400 hover:text-red-500 font-medium text-xl p-2 rounded-lg transition" 
                  title="Remove Item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Checkout/Bill Card */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl h-fit space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Order Summary</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal Items:</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping Fee:</span>
              <span>{shippingPrice === 0 ? "Free" : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between font-bold text-base text-gray-900">
              <span>Total Bill:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            <button 
              onClick={checkoutHandler} 
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-100"
            >
              Proceed to Shipping Info 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
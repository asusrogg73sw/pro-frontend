import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  listMyOrders,
  deleteOrder,
  toggleOrderLockAction,
  
} from "../store/orderSlice";
import type { Order } from "../store/orderSlice"
import { ShoppingBag, Trash2, Lock, Unlock, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const MyOrdersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { orders, loading, error } = useAppSelector(
    (state) => state.orders || { orders: [] },
  );
  const { userInfo } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(listMyOrders());
  }, [dispatch]);

  // 🔒 Lock State Mutation Handler
  const handleToggleLock = (orderId: string) => {
    dispatch(toggleOrderLockAction(orderId))
      .unwrap()
      .catch((err: string) => alert(err || "Failed to update lock configurations."));
  };

  // 🗑️ Delete/Cancel Order Handler Logic
  const handleDeleteOrder = (orderId: string) => {
    if (
      window.confirm(
        "Kya aap is order ko permanently delete/cancel karna chahte hain? 🚨",
      )
    ) {
      dispatch(deleteOrder(orderId))
        .unwrap()
        .then(() => {
          alert("Order successfully canceled/deleted! 💥");
        })
        .catch((err: string) => {
          alert(err || "Failed to delete order.");
        });
    }
  };

  if (loading)
    return (
      <div className="text-center py-24 text-gray-400 font-medium tracking-wide animate-pulse">
        Synchronizing order history registers... 🛍️
      </div>
    );
  if (error)
    return (
      <div className="text-center py-24 text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-2 min-h-screen">
      <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">
        Welcome back, <span className="text-blue-600">{userInfo?.name}</span>! Your Orders 🛍️
      </h2>

      {orders && orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No Orders Found</h3>
          <p className="text-gray-400 text-sm mt-1">
            Aap ne abhi tak koi order place nahi kiya.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-xs font-black text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="p-5">Order ID</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Total Invoice</th>
                  <th className="p-5">Payment Status</th>
                  <th className="p-5">Logistic Delivery</th>
                  <th className="p-5 text-center">Safety Lock</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-600">
                {orders.map((order: Order) => {
                  const isCurrentlyProtected = order.isUserLocked === true;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/50 transition duration-150"
                    >
                      {/* Order ID */}
                      <td className="p-5 font-mono text-xs">
                        <Link
                          to={`/order-pay/${order._id}`}
                          className="text-blue-600 hover:text-blue-800 font-bold tracking-tight transition"
                        >
                          {order._id}
                        </Link>
                      </td>

                      {/* Date */}
                      <td className="p-5 text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Total Invoice */}
                      <td className="p-5 font-black text-gray-900">
                        ${order.totalPrice.toFixed(2)}
                      </td>

                      {/* Payment Status */}
                      <td className="p-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${order.isPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${order.isPaid ? "bg-emerald-500" : "bg-red-500"}`}
                          ></span>
                          {order.isPaid ? "Settled" : "Awaiting Payment"}
                        </span>
                      </td>

                      {/* Logistic Delivery */}
                      <td className="p-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${order.isDelivered ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}
                        >
                          {order.isDelivered
                            ? "Dispatched"
                            : "Processing Logistics"}
                        </span>
                      </td>

                      {/* 🔒 INTERACTIVE SAFETY LOCK */}
                      <td className="p-5 text-center">
                        <button
                          onClick={() => handleToggleLock(order._id)}
                          className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                            order.isUserLocked
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                              : "bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
                          }`}
                          title={
                            order.isUserLocked
                              ? "Click to Unlock Order"
                              : "Click to Lock Order"
                          }
                        >
                          {order.isUserLocked ? (
                            <Lock size={15} />
                          ) : (
                            <Unlock size={15} />
                          )}
                        </button>
                      </td>

                      {/* ACTIONS CONTROL BLOCK */}
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {!order.isPaid && (
                            <button
                              onClick={() =>
                                navigate(`/order-pay/${order._id}`)
                              }
                              className="inline-flex items-center gap-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition transform hover:-translate-y-0.5"
                            >
                              <CreditCard size={12} />
                              Pay
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            disabled={isCurrentlyProtected}
                            className={`p-2 rounded-xl transition ${
                              isCurrentlyProtected
                                ? "text-gray-200 bg-gray-50/20 cursor-not-allowed opacity-40"
                                : "text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                            }`}
                            title={
                              isCurrentlyProtected
                                ? "Order is locked! Unlock first to delete."
                                : "Delete Order"
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
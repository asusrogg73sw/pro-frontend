import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { listOrders, deliverOrder } from "../store/orderSlice";
import type { Order } from "../store/orderSlice"
import { useNavigate } from "react-router-dom";
import { ShieldAlert, CreditCard, Truck } from "lucide-react";

const OrderListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { orders, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(listOrders());
  }, [dispatch]);

  const deliverHandler = async (id: string) => {
    if (window.confirm("Kya aap is order ko Delivered mark karna chahte hain?")) {
      try {
        await dispatch(deliverOrder(id)).unwrap();
        alert("Order status updated to Delivered! 🚚");
      } catch (err) {
        alert("Status update failed: " + err);
      }
    }
  };

  if (loading) return <div className="text-center py-24 text-gray-400 font-medium tracking-wide animate-pulse">Fetching Admin Logistics Manifest Array...</div>;
  if (error) return <div className="text-center py-24 text-red-500 font-semibold">{error}</div>;

  return (
    <div className="p-4 md:p-8 bg-white rounded-3xl shadow-md border border-gray-100 max-w-6xl mx-auto mt-6 min-h-screen">
      <h2 className="text-3xl font-black mb-8 text-gray-900 flex items-center gap-2 tracking-tight">
        <ShieldAlert size={30} className="text-blue-600" />
        Orders Command Center
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 text-xs font-black text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="p-5">Order ID</th>
              <th className="p-5">Customer Profile</th>
              <th className="p-5">Timestamp</th>
              <th className="p-5">Total Fee</th>
              <th className="p-5">Financial Settlement</th>
              <th className="p-5">Logistics Node</th>
              <th className="p-5 text-center">Operation Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-600">
            {orders.map((order: Order) => {
              // Safe type detection for populated user data
              const customerName = typeof order.user === "object" && order.user !== null 
                ? order.user.name 
                : "Unknown User";

              return (
                <tr key={order._id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="p-5 font-mono text-xs text-blue-600 font-bold">{order._id}</td>
                  <td className="p-5 text-gray-900 font-bold">{customerName}</td>
                  <td className="p-5 text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-5 font-black text-gray-900">${order.totalPrice.toFixed(2)}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${order.isPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${order.isDelivered ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-yellow-50 text-yellow-700 border border-yellow-100"}`}>
                      {order.isDelivered ? "Delivered" : "Pending Processing"}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!order.isPaid && (
                        <button
                          onClick={() => navigate(`/order-pay/${order._id}`)}
                          className="inline-flex items-center gap-1 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-black shadow-sm transition"
                        >
                          <CreditCard size={12} />
                          Pay Now
                        </button>
                      )}

                      {order.isPaid && !order.isDelivered && (
                        <button
                          onClick={() => deliverHandler(order._id)}
                          className="inline-flex items-center gap-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-black shadow-sm transition"
                        >
                          <Truck size={12} />
                          Mark Dispatched
                        </button>
                      )}
                      {order.isPaid && order.isDelivered && (
                        <span className="text-xs text-gray-400 font-bold italic tracking-wide">Completed</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderListPage;
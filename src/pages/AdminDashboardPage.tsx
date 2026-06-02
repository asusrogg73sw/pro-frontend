// src/pages/AdminDashboardPage.tsx
import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from "lucide-react";
import API from "../api/axios";

interface Stats {
  totalSales: number;
  ordersCount: number;
  usersCount: number;
  productsCount: number;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Backend route matches exactly: router.route("/stats").get(getDashboardStats);
        const response = await API.get("/admin/stats");
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-12 font-medium">Loading Dashboard Analytics... 📊</div>;
  if (error) return <div className="text-center py-12 text-red-500 font-medium">{error}</div>;

  // Fallback defaults agar data empty ya delayed ho
  const dataCards = [
    { title: "Total Sales", value: `$${stats?.totalSales || 0}`, icon: DollarSign, color: "bg-green-50 text-green-600 border-green-100" },
    { title: "Total Orders", value: stats?.ordersCount || 0, icon: ShoppingBag, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { title: "Registered Users", value: stats?.usersCount || 0, icon: Users, color: "bg-purple-50 text-purple-600 border-purple-100" },
    { title: "Total Products", value: stats?.productsCount || 0, icon: Package, color: "bg-amber-50 text-amber-600 border-amber-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Upper Title Section */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Status & Analytics Overview</h2>
        <p className="text-xs text-gray-400 mt-0.5">Real-time business summary parameters logged from database session.</p>
      </div>

      {/* 🌟 4 Alag Alag Analytic Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dataCards.map((card, i) => {
          const IconComponent = card.icon;
          return (
            <div key={i} className={`p-6 bg-white border rounded-2xl shadow-sm transition flex items-center justify-between group hover:shadow-md`}>
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</span>
                <p className="text-2xl font-black text-gray-800 tracking-tight">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${card.color} group-hover:scale-105 transition duration-200`}>
                <IconComponent size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Graph Placeholder Context */}
      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center min-h-55">
        <div className="text-center text-gray-400 space-y-2">
          <TrendingUp className="mx-auto text-blue-500" size={32} />
          <h4 className="font-bold text-gray-700 text-sm">Monthly Sales & Top Products Connected</h4>
          <p className="text-xs max-w-xs">Data streaming operational. Add chart visualization frameworks if needed.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
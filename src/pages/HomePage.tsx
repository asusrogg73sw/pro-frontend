import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks'; // Naye hooks
import { fetchStats } from '../store/adminSlice';

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  if (loading) return <div className="text-center py-10">Loading Live Stats...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Revenue Card */}
      <div className="p-6 bg-white shadow-lg rounded-xl border-t-4 border-green-500">
        <h3 className="text-gray-500 font-medium">Total Revenue</h3>
        <p className="text-3xl font-bold text-gray-800">${stats?.totalRevenue || 0}</p>
      </div>

      {/* Orders Card */}
      <div className="p-6 bg-white shadow-lg rounded-xl border-t-4 border-blue-500">
        <h3 className="text-gray-500 font-medium">Total Orders</h3>
        <p className="text-3xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
      </div>

      {/* Users Card */}
      <div className="p-6 bg-white shadow-lg rounded-xl border-t-4 border-purple-500">
        <h3 className="text-gray-500 font-medium">Total Users</h3>
        <p className="text-3xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
      </div>

      {/* Products Card */}
      <div className="p-6 bg-white shadow-lg rounded-xl border-t-4 border-orange-500">
        <h3 className="text-gray-500 font-medium">Total Products</h3>
        <p className="text-3xl font-bold text-gray-800">{stats?.totalProducts || 0}</p>
      </div>
    </div>
  );
};

export default HomePage;
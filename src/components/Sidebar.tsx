import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Users, LogOut } from "lucide-react";
import { useAppDispatch } from "../store/hooks";
import { logoutUser } from "../store/authSlice";

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    // navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-10 text-blue-400 px-2">Pro Admin</h1>

      <nav className="flex-1 space-y-2">
        <Link
          to="/"
          className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition"
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/products"
          className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition"
        >
          <ShoppingBag size={20} />
          <span>Products</span>
        </Link>
        <Link
          to="/users"
          className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition"
        >
          <Users size={20} />
          <span>Users</span>
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition mt-auto"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;

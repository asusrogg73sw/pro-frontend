// src/components/Navbar.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logoutUser } from "../store/authSlice";
import { ShoppingCart, User, LogOut, LayoutDashboard, ShoppingBag, Settings, ChevronDown } from "lucide-react";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown state
  const [isOpen, setIsOpen] = useState(false);

  const { userInfo } = useAppSelector((state) => state.auth);
  const { cartItems } = useAppSelector((state) => state.cart);

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logoutUser());
      setIsOpen(false);
      navigate("/login");
    }
  };

  // Click outside to close dropdown handler
 useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Change isOpen(false) to setIsOpen(false)
        setIsOpen(false); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 🛍️ LEFT SIDE: Shop Logo & Dashboard Option */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:bg-blue-700 transition">
                <ShoppingBag size={20} />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                PRO<span className="text-blue-600">STORE</span>
              </span>
            </Link>

            {userInfo?.isAdmin && (
              <Link 
                to="/admin/dashboard" 
                className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-xl transition"
              >
                <LayoutDashboard size={16} />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          {/* 🛒 RIGHT SIDE: Cart & Profile Dropdown */}
          <div className="flex items-center gap-4">
            
            {/* Cart Icon */}
            <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 transition p-2">
              <ShoppingCart size={22} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {userInfo ? (
              /* 🚀 NEW FIX: Unified User Dropdown Container */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 transition active:scale-95"
                >
                  <User size={16} className="text-gray-500" />
                  <span>{userInfo.name}</span>
                  <ChevronDown size={14} className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu Cards */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    
                    <Link
                      to="/my-orders"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
                    >
                      <ShoppingBag size={16} />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
                    >
                      <Settings size={16} />
                      <span>Profile Settings</span>
                    </Link>

                    <hr className="my-1 border-gray-100" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-medium"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-blue-600 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl transition"
              >
                <User size={16} />
                <span>Sign In</span>
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Agar login page nahi hai, to sidebar dikhao */}
      {!isLoginPage && <Sidebar />}
      
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const ProtectedRoute = () => {
  const { userInfo } = useAppSelector((state) => state.auth);

  // Agar user login hai to 'Outlet' (yaani child page) dikhao, warna login par bhej do
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
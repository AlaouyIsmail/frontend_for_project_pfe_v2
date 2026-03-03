import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, paymentValidated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!paymentValidated && location.pathname !== '/checkout')
    return <Navigate to="/checkout" replace />;
  return <Outlet />;
}

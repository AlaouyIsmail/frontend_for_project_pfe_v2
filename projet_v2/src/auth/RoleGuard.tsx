import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface Props {
  allowedRoles: ('RH' | 'CHEF' | 'RESSOURCE')[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: Props) {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

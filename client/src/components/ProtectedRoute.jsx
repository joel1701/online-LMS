import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from './States';
import Forbidden from '../pages/shared/Forbidden';

export default function ProtectedRoute({ roles, children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <LoadingState label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Forbidden />;
  return children;
}

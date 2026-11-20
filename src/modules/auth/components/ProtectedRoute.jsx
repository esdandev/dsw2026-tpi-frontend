import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';

function ProtectedRoute({ children, allowedRole, redirectTo = '/login' }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    const homePath =
      role === 'ADMINISTRADOR'
        ? '/admin/home'
        : role === 'PACIENTE'
          ? '/'
          : redirectTo;

    return <Navigate to={homePath} replace />;
  }

  return children;
}

export default ProtectedRoute;

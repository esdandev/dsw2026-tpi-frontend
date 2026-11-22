import { Navigate } from 'react-router-dom';
import useSession from '../hook/useSession';
import { HOME_BY_ROLE } from '../constants';

function ProtectedRoute({
  children,
  allowedRole,
  allowedRoles,
  redirectTo = '/login',
}) {
  const { isAuthenticated, role } = useSession();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const allowed = allowedRoles ?? (allowedRole ? [allowedRole] : []);

  if (allowed.length > 0 && !allowed.includes(role)) {
    return <Navigate to={HOME_BY_ROLE[role] || redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;

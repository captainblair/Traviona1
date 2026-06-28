import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { canAccessAdmin } from '../../lib/adminAccess.js';

export default function RequireAdminAccess({ children }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="admin-loading">
        <p>Loading admin…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!canAccessAdmin(user)) {
    return (
      <div className="admin-denied">
        <h1>Access denied</h1>
        <p>Your account does not have staff permissions. Contact an administrator.</p>
        <a href="/">Return to site</a>
      </div>
    );
  }

  return children;
}

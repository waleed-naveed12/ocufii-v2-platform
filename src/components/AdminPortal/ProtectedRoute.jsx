import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/AdminPortal/useAuth";
import { ROUTE } from "../../common/AdminPortal/Routes";

/**
 * ProtectedRoute component for role-based access control
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string[]} allowedRoles - Array of roles allowed to access this route (empty = all authenticated users)
 * @param {string} redirectTo - Custom redirect path for unauthorized users
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = ROUTE.DASHBOARD,
}) => {
  const { isAuthenticated, isLoading, canAccessRoute } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTE.LOGIN} replace />;
  }

  // Authenticated but not authorized for this route
  if (!canAccessRoute(allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Authenticated and authorized
  return children;
};

export default ProtectedRoute;

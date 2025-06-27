import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectUserTableAccess,
  selectUserPermissions,
  selectIsTokenExpired,
} from "../store/slices/authSlice";
import { getTableNameFromRoute, hasTableAccess } from "../utils/tableValues";
import { useTokenValidation } from "../hooks/useTokenValidation";

export default function ProtectedRoute({
  children,
  requireTableAccess = false,
}) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const tableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);
  const isTokenExpired = useSelector(selectIsTokenExpired);
  const location = useLocation();
  const { validateToken } = useTokenValidation();

  // Check token validity first
  if (isAuthenticated && isTokenExpired) {
    console.warn("Token expired in ProtectedRoute, validating...");
    validateToken();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superadmin bypasses all permission checks
  const isSuperadmin = userPermissions?.isSuperadmin || false;
  if (isSuperadmin) {
    return children;
  }

  // If table access is required, check if user has access to the specific table
  if (requireTableAccess) {
    const tableName = getTableNameFromRoute(location.pathname);

    if (tableName && !hasTableAccess(tableAccess, tableName)) {
      // User doesn't have access to this table, redirect to dashboard
      console.warn(
        `Access denied to table: ${tableName} for route: ${location.pathname}`
      );
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

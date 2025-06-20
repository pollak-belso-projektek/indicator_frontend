import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectUserTableAccess,
  selectUserPermissions,
} from "../store/slices/authSlice";
import { getTableNameFromRoute, hasTableAccess } from "../utils/tableValues";

/**
 * TableProtectedRoute component that enforces both authentication and table access permissions
 * This component ensures users can only access routes for tables they have permission to view
 * Superadmins bypass all permission checks
 */
export default function TableProtectedRoute({ children, tableName = null }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const tableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superadmin bypasses all permission checks
  const isSuperadmin = userPermissions?.isSuperadmin || false;
  if (isSuperadmin) {
    return children;
  }

  // Determine table name - either provided explicitly or derived from route
  const targetTableName = tableName || getTableNameFromRoute(location.pathname);

  if (targetTableName && !hasTableAccess(tableAccess, targetTableName)) {
    // User doesn't have access to this table, redirect to dashboard
    console.warn(
      `Access denied to table: ${targetTableName} for route: ${location.pathname}`
    );
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

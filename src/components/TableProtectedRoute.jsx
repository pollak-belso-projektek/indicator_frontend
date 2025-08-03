import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  selectIsAuthenticated,
  selectUserTableAccess,
  selectUserPermissions,
  selectIsTokenExpired,
} from "../store/slices/authSlice";
import { getTableNameFromRoute, hasTableAccess } from "../utils/tableValues";
import { useTokenValidation } from "../hooks/useTokenValidation";

/**
 * TableProtectedRoute component that enforces both authentication and table access permissions
 * This component ensures users can only access routes for tables they have permission to view
 * Superadmins bypass all permission checks
 */
export default function TableProtectedRoute({ children, tableName = null }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const tableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);
  const isTokenExpired = useSelector(selectIsTokenExpired);
  const location = useLocation();
  const { validateToken } = useTokenValidation();

  // Use ref to prevent multiple token validation calls
  const tokenValidationTriggered = useRef(false);

  // Handle token expiration in useEffect to prevent render loops
  useEffect(() => {
    if (
      isAuthenticated &&
      isTokenExpired &&
      !tokenValidationTriggered.current
    ) {
      console.warn("Token expired in TableProtectedRoute, validating...");
      tokenValidationTriggered.current = true;
      validateToken();

      // Reset the flag after a delay to allow future validations if needed
      const timer = setTimeout(() => {
        tokenValidationTriggered.current = false;
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isTokenExpired, validateToken]);

  // Don't redirect if token is being refreshed - just let the auth system handle it
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token is expired, let the TokenValidationGuard and ProactiveTokenRefresh handle it
  // Don't block rendering here, just let the validation happen in the background

  // Superadmin bypasses all permission checks
  const isSuperadmin = userPermissions?.isSuperadmin || false;
  if (isSuperadmin) {
    return children;
  }

  // Determine table name - either provided explicitly or derived from route
  const targetTableName = tableName || getTableNameFromRoute(location.pathname);

  // Special case for logs - only admins and superadmins can access
  if (targetTableName === "logs") {
    const isAdmin = userPermissions?.isAdmin || userPermissions?.isSuperadmin;
    if (!isAdmin) {
      console.warn(
        `Access denied to logs - admin permissions required for route: ${location.pathname}`
      );
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  if (targetTableName && !hasTableAccess(tableAccess, targetTableName)) {
    // User doesn't have access to this table, redirect to dashboard
    console.warn(
      `Access denied to table: ${targetTableName} for route: ${location.pathname}`
    );
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

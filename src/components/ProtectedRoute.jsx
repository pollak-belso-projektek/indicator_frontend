import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  selectIsAuthenticated,
  selectUserTableAccess,
  selectUserPermissions,
  selectIsTokenExpired,
  selectUser,
} from "../store/slices/authSlice";
import { getTableNameFromRoute, hasTableAccess } from "../utils/tableValues";
import { useTokenRefresh } from "../hooks/useTokenRefresh";
import TokenRefreshLoader from "./TokenRefreshLoader";

export default function ProtectedRoute({
  children,
  requireTableAccess = false,
}) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const tableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);
  const isTokenExpired = useSelector(selectIsTokenExpired);

  const user = useSelector(selectUser);
  const location = useLocation();
  const { manualRefresh, hasValidRefreshToken, isRefreshInProgress } =
    useTokenRefresh();

  // Track refresh attempts to prevent infinite loops
  const refreshAttempted = useRef(false);

  // Handle token refresh when expired
  useEffect(() => {
    if (
      isAuthenticated &&
      isTokenExpired &&
      hasValidRefreshToken &&
      !refreshAttempted.current &&
      !isRefreshInProgress
    ) {
      console.warn("Token expired in ProtectedRoute, attempting refresh...");
      refreshAttempted.current = true;

      manualRefresh()
        .then(() => {
          console.log("Token refresh successful in ProtectedRoute");
          refreshAttempted.current = false;
        })
        .catch((error) => {
          console.error("Token refresh failed in ProtectedRoute:", error);
          refreshAttempted.current = false;
          // The manualRefresh function already handles logout on failure
        });
    }
  }, [
    isAuthenticated,
    isTokenExpired,
    hasValidRefreshToken,
    manualRefresh,
    isRefreshInProgress,
  ]);

  // Reset refresh attempt flag when token is no longer expired
  useEffect(() => {
    if (!isTokenExpired) {
      refreshAttempted.current = false;
    }
  }, [isTokenExpired]);


 useEffect(() => {
  console.log(user);
 }, [user]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token is expired and no refresh token available, redirect to login
  if (isTokenExpired && !hasValidRefreshToken) {
    console.warn("Token expired and no refresh token available");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token is expired but refresh is in progress or attempted, show loading
  if (isTokenExpired && (isRefreshInProgress || refreshAttempted.current)) {
    return <TokenRefreshLoader />;
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
      return <Navigate 
        to="/dashboard" 
        state={{ 
          redirectReason: 'table_access_denied',
          fromRoute: location.pathname,
          tableName: tableName
        }} 
        replace 
      />;
    }
  }

  return children;
}

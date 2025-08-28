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
import { useAccessNotification } from "../contexts/AccessNotificationContext";

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
  const { notifyAccessDenied, notifyInsufficientPermissions } = useAccessNotification();

  // Debug logging
  console.log("TableProtectedRoute Debug:", {
    route: location.pathname,
    tableName,
    isAuthenticated,
    tableAccess,
    userPermissions,
    isTokenExpired
  });

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

  // Check if user has no table access at all
  if (!tableAccess || !Array.isArray(tableAccess) || tableAccess.length === 0) {
    // Only allow dashboard access for users with no table access
    if (location.pathname !== "/dashboard") {
      console.warn(
        `Access denied - no table access for route: ${location.pathname}`
      );
      
      // Show notification
      setTimeout(() => {
        notifyAccessDenied(location.pathname, "no_access");
      }, 100);
      
      return <Navigate 
        to="/dashboard" 
        state={{ 
          redirectReason: 'no_table_access',
          fromRoute: location.pathname
        }} 
        replace 
      />;
    }
    return children;
  }

  // Determine table name - either provided explicitly or derived from route
  const targetTableName = tableName || getTableNameFromRoute(location.pathname);

  // Special case for table management - only superadmins can access
  if (targetTableName === "table-management" || location.pathname === "/table-management") {
    const isSuperadmin = userPermissions?.isSuperadmin;
    if (!isSuperadmin) {
      console.warn(
        `Access denied to table management - superadmin permissions required for route: ${location.pathname}`
      );
      
      // Show notification
      setTimeout(() => {
        notifyInsufficientPermissions(location.pathname, "superadmin");
      }, 100);
      
      return <Navigate 
        to="/dashboard" 
        state={{ 
          redirectReason: 'insufficient_permissions',
          fromRoute: location.pathname,
          requiredRole: 'superadmin'
        }} 
        replace 
      />;
    }
    return children;
  }

  // Special case for data import - requires admin or access to data tables
  if (targetTableName === "data-import" || location.pathname === "/adat-import") {
    const isAdmin = userPermissions?.isAdmin || userPermissions?.isSuperadmin;
    const hasDataTableAccess = tableAccess && Array.isArray(tableAccess) && 
      tableAccess.some(access => 
        ["alapadatok", "tanulo_letszam", "kompetencia", "tanugyi_adatok"].includes(access.tableName)
      );
    
    if (!isAdmin && !hasDataTableAccess) {
      console.warn(
        `Access denied to data import - admin permissions or data table access required for route: ${location.pathname}`
      );
      
      // Show notification
      setTimeout(() => {
        notifyInsufficientPermissions(location.pathname, "admin_or_data_access");
      }, 100);
      
      return <Navigate 
        to="/dashboard" 
        state={{ 
          redirectReason: 'insufficient_permissions',
          fromRoute: location.pathname,
          requiredRole: 'admin_or_data_access'
        }} 
        replace 
      />;
    }
    return children;
  }

  // Special case for logs - only superadmins can access
  if (targetTableName === "log" || targetTableName === "logs") {
    const isSuperadmin = userPermissions?.isSuperadmin;
    if (!isSuperadmin) {
      console.warn(
        `Access denied to logs - superadmin permissions required for route: ${location.pathname}`
      );
      
      // Show notification
      setTimeout(() => {
        notifyInsufficientPermissions(location.pathname, "superadmin");
      }, 100);
      
      return <Navigate 
        to="/dashboard" 
        state={{ 
          redirectReason: 'insufficient_permissions',
          fromRoute: location.pathname,
          requiredRole: 'superadmin'
        }} 
        replace 
      />;
    }
    return children;
  }

  // Special case for users - only superadmins can access
  if (targetTableName === "user") {
    const isSuperadmin = userPermissions?.isSuperadmin;
    if (!isSuperadmin) {
      console.warn(
        `Access denied to users - superadmin permissions required for route: ${location.pathname}`
      );
      
      // Show notification
      setTimeout(() => {
        notifyInsufficientPermissions(location.pathname, "superadmin");
      }, 100);
      
      return <Navigate 
        to="/dashboard" 
        state={{ 
          redirectReason: 'insufficient_permissions',
          fromRoute: location.pathname,
          requiredRole: 'superadmin'
        }} 
        replace 
      />;
    }
    return children;
  }

  if (targetTableName && !hasTableAccess(tableAccess, targetTableName)) {
    // User doesn't have access to this table, redirect to dashboard
    console.warn(
      `Access denied to table: ${targetTableName} for route: ${location.pathname}`
    );
    
    // Show notification
    setTimeout(() => {
      notifyAccessDenied(location.pathname, targetTableName);
    }, 100);
    
    return <Navigate 
      to="/dashboard" 
      state={{ 
        redirectReason: 'table_access_denied',
        fromRoute: location.pathname,
        tableName: targetTableName
      }} 
      replace 
    />;
  }

  return children;
}

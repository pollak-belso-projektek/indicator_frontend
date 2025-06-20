import { useSelector } from "react-redux";
import {
  selectUserTableAccess,
  selectUserPermissions,
} from "../store/slices/authSlice";
import {
  hasRouteAccess,
  getAccessibleRoutes,
  hasTableAccess,
} from "../utils/tableValues";

/**
 * Hook for managing route and table access permissions
 * Provides centralized access control logic for routing and UI components
 */
export const useRouteAccess = () => {
  const tableAccess = useSelector(selectUserTableAccess);
  const userPermissions = useSelector(selectUserPermissions);

  // Check if user is Superadmin (bypasses all permission checks)
  const isSuperadmin = userPermissions?.isSuperadmin || false;

  /**
   * Check if user can access a specific route
   * @param {string} route - The route path to check
   * @returns {boolean} - Whether user has access
   */
  const canAccessRoute = (route) => {
    // Superadmin can access everything
    if (isSuperadmin) {
      return true;
    }
    return hasRouteAccess(tableAccess, route);
  };

  /**
   * Check if user can access a specific table
   * @param {string} tableName - The table name to check
   * @returns {boolean} - Whether user has access
   */
  const canAccessTable = (tableName) => {
    // Superadmin can access all tables
    if (isSuperadmin) {
      return true;
    }
    return hasTableAccess(tableAccess, tableName);
  };

  /**
   * Get all routes the user can access
   * @returns {Array} - Array of accessible route paths
   */
  const accessibleRoutes = isSuperadmin
    ? // Superadmin gets all routes
      [
        "/dashboard",
        "/adat-import",
        "/alapadatok",
        "/tanulo_letszam",
        "/kompetencia",
        "/versenyek",
        "/tanugyi_adatok",
        "/felvettek_szama",
        "/users",
      ]
    : getAccessibleRoutes(tableAccess);
  return {
    canAccessRoute,
    canAccessTable,
    accessibleRoutes,
    tableAccess,
    isSuperadmin,
  };
};

export default useRouteAccess;

import { useSelector } from "react-redux";
import { selectUserPermissions, selectUserTableAccess } from "../../store/slices/authSlice";

/**
 * useAccessControl Hook
 * 
 * A custom hook that provides utilities for checking user access permissions
 * throughout the application.
 * 
 * @returns {Object} Access control utilities
 */
export const useAccessControl = () => {
  const userPermissions = useSelector(selectUserPermissions);
  const tableAccess = useSelector(selectUserTableAccess);

  /**
   * Check if user has access to a specific table action
   * @param {string} tableName - The table name to check
   * @param {string} action - The action: 'read', 'create', 'update', 'delete'
   * @returns {boolean} Whether user has access
   */
  const hasTableAccess = (tableName, action = 'read') => {
    if (!userPermissions) return false;

    // Superadmin and HSZC Admin have access to everything
    if (userPermissions.isSuperadmin || userPermissions.isHSZC) {
      return true;
    }

    if (!tableName) return false;

    const tablePermission = tableAccess?.find(
      (access) => access.tableName === tableName
    );

    if (!tablePermission) return false;

    const actionMap = {
      'read': 'canRead',
      'create': 'canCreate', 
      'update': 'canUpdate',
      'delete': 'canDelete'
    };

    const permissionKey = actionMap[action];
    return tablePermission?.permissions[permissionKey] || false;
  };

  /**
   * Check if user has any CRUD access to a table
   * @param {string} tableName - The table name to check
   * @returns {Object} Object with CRUD permissions
   */
  const getTablePermissions = (tableName) => {
    if (!userPermissions) {
      return { canRead: false, canCreate: false, canUpdate: false, canDelete: false };
    }

    // Superadmin and HSZC Admin have full access
    if (userPermissions.isSuperadmin || userPermissions.isHSZC) {
      return { canRead: true, canCreate: true, canUpdate: true, canDelete: true };
    }

    const tablePermission = tableAccess?.find(
      (access) => access.tableName === tableName
    );

    if (!tablePermission) {
      return { canRead: false, canCreate: false, canUpdate: false, canDelete: false };
    }

    return tablePermission.permissions;
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} Whether user is authenticated
   */
  const isAuthenticated = () => {
    return !!userPermissions;
  };

  /**
   * Check if user has specific role permissions
   * @param {string} role - Role to check: 'superadmin', 'hszc', 'admin', 'privileged', 'standard'
   * @returns {boolean} Whether user has the role
   */
  const hasRole = (role) => {
    if (!userPermissions) return false;

    const roleMap = {
      'superadmin': userPermissions.isSuperadmin,
      'hszc': userPermissions.isHSZC,
      'admin': userPermissions.isAdmin,
      'privileged': userPermissions.isPrivileged,
      'standard': userPermissions.isStandard
    };

    return roleMap[role] || false;
  };

  /**
   * Get user's highest role
   * @returns {string} The highest role the user has
   */
  const getHighestRole = () => {
    if (!userPermissions) return 'none';
    
    if (userPermissions.isSuperadmin) return 'superadmin';
    if (userPermissions.isHSZC) return 'hszc';
    if (userPermissions.isAdmin) return 'admin';
    if (userPermissions.isPrivileged) return 'privileged';
    if (userPermissions.isStandard) return 'standard';
    
    return 'none';
  };

  /**
   * Get list of accessible tables with their permissions
   * @returns {Array} Array of accessible tables
   */
  const getAccessibleTables = () => {
    if (!userPermissions) return [];

    // Superadmin and HSZC Admin have access to all tables
    if (userPermissions.isSuperadmin || userPermissions.isHSZC) {
      // Return all possible tables with full permissions
      // You might want to define this list based on your application's tables
      return tableAccess?.map(access => ({
        ...access,
        permissions: { canRead: true, canCreate: true, canUpdate: true, canDelete: true }
      })) || [];
    }

    // Return only tables user has at least read access to
    return tableAccess?.filter(access => access.permissions.canRead) || [];
  };

  /**
   * Check if user can access a specific page/route
   * @param {string} route - The route to check
   * @param {string} requiredTable - Table name required for the route
   * @param {string} requiredAction - Action required for the route
   * @returns {boolean} Whether user can access the route
   */
  const canAccessRoute = (route, requiredTable = null, requiredAction = 'read') => {
    if (!userPermissions) return false;

    // Some routes might not require table permissions
    if (!requiredTable) {
      return isAuthenticated();
    }

    return hasTableAccess(requiredTable, requiredAction);
  };

  return {
    hasTableAccess,
    getTablePermissions,
    isAuthenticated,
    hasRole,
    getHighestRole,
    getAccessibleTables,
    canAccessRoute,
    userPermissions,
    tableAccess
  };
};

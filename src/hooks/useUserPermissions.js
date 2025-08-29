import { useSelector } from "react-redux";
import {
  selectUserPermissions,
  selectUserRole,
  selectUserTableAccess,
} from "../store/slices/authSlice";

// Custom hook for checking user permissions
export const useUserPermissions = () => {
  const permissions = useSelector(selectUserPermissions);
  const role = useSelector(selectUserRole);
  const tableAccess = useSelector(selectUserTableAccess);

  const hasPermission = (permission) => {
    return permissions?.[permission] || false;
  };

  const hasTablePermission = (tableName, permission) => {
    const table = tableAccess?.find((t) => t.tableName === tableName);
    return table?.permissions?.[permission] || false;
  };
  const isAtLeastRole = (requiredRole) => {
    const roleHierarchy = {
      iskolai_general: 1,
      iskolai_privileged: 2,
      iskolai_admin: 4,
      hszc_general: 9,
      hszc_privileged: 10,
      hszc_admin: 15,
      superadmin: 31,
      // Legacy compatibility
      Standard: 1,
      Privileged: 2,
      Admin: 4,
      HSZC: 9,
      Superadmin: 31,
    };

    const userLevel = roleHierarchy[role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };
  // User management specific permissions
  const canCreateUser = (targetUserType) => {
    if (hasPermission("isSuperadmin")) {
      return true; // Superadmin can create any type
    }

    if (hasPermission("isHSZC") && hasPermission("isAdmin")) {
      // HSZC ADMIN can create HSZC and Iskolai users
      return [
        "hszc_privileged",
        "hszc_general",
        "iskolai_admin",
        "iskolai_privileged",
        "iskolai_general",
      ].includes(targetUserType?.toLowerCase());
    }

    if (hasPermission("isAdmin") && !hasPermission("isHSZC")) {
      // ISKOLAI ADMIN can create only iskolai users and iskolai admins
      return [
        "iskolai_admin",
        "iskolai_privileged",
        "iskolai_general",
      ].includes(targetUserType?.toLowerCase());
    }

    return false;
  };

  const canModifyUser = () => {
    // Only admins can modify users
    return hasPermission("isAdmin") || hasPermission("isSuperadmin");
  };

  const canDeactivateUser = () => {
    // Only admins can deactivate users (no deletion, only deactivation)
    return hasPermission("isAdmin") || hasPermission("isSuperadmin");
  };
  const getAvailableUserTypes = () => {
    if (hasPermission("isSuperadmin")) {
      // Superadmin can create all user types
      return [
        { value: "superadmin", label: "Fejlesztő" },
        { value: "hszc_admin", label: "HSZC Admin" },
        { value: "hszc_privileged", label: "HSZC Privilegizált" },
        { value: "hszc_general", label: "HSZC Általános" },
        { value: "iskolai_admin", label: "Iskolai Admin" },
        { value: "iskolai_privileged", label: "Iskolai Privilegizált" },
        { value: "iskolai_general", label: "Iskolai Általános" },
      ];
    }

    if (hasPermission("isHSZC") && hasPermission("isAdmin")) {
      // HSZC ADMIN can create HSZC and Iskolai users
      return [
        { value: "hszc_privileged", label: "HSZC Privilegizált" },
        { value: "hszc_general", label: "HSZC Általános" },
        { value: "iskolai_admin", label: "Iskolai Admin" },
        { value: "iskolai_privileged", label: "Iskolai Privilegizált" },
        { value: "iskolai_general", label: "Iskolai Általános" },
      ];
    }

    if (hasPermission("isAdmin") && !hasPermission("isHSZC")) {
      // ISKOLAI ADMIN can create only iskolai users and iskolai admins
      return [
        { value: "iskolai_admin", label: "Iskolai Admin" },
        { value: "iskolai_privileged", label: "Iskolai Privilegizált" },
        { value: "iskolai_general", label: "Iskolai Általános" },
      ];
    }

    return [];
  };
  return {
    permissions,
    role,
    tableAccess,
    hasPermission,
    hasTablePermission,
    isAtLeastRole,
    // Specific permission checks
    isSuperadmin: hasPermission("isSuperadmin"),
    isAdmin: hasPermission("isAdmin"),
    isHSZC: hasPermission("isHSZC"),
    isPrivileged: hasPermission("isPrivileged"),
    isStandard: hasPermission("isStandard"),
    // User management permissions
    canCreateUser,
    canModifyUser,
    canDeactivateUser,
    getAvailableUserTypes,
  };
};

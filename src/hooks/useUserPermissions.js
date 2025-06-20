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
      Standard: 1,
      Privileged: 2,
      HSZC: 3,
      Admin: 4,
      Superadmin: 5,
    };

    const userLevel = roleHierarchy[role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
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
  };
};

import { hasTablePermission, TABLE_ACCESS_LEVELS } from "../../utils/tableAccessUtils";
import { getAlwaysVisibleItems, getPermissionBasedItems } from "./navigationConfig";

export const useNavigationFilter = (userTableAccess, userPermissions, itemSearch = "") => {
  // Filter navigation items based on permissions
  const getAccessibleNavItems = () => {
    const alwaysVisibleItems = getAlwaysVisibleItems();
    const permissionBasedItems = getPermissionBasedItems();
    
    // Filter items based on table access permissions
    const accessibleItems = permissionBasedItems.filter((item) => {
      if (!item.tableName) return true; // Items without table requirements are always accessible
      
      // Check if user has at least READ access to the table
      return hasTablePermission(
        userTableAccess,
        item.tableName,
        TABLE_ACCESS_LEVELS.READ
      );
    });

    return [...alwaysVisibleItems, ...accessibleItems];
  };

  // Filter items based on search
  const filterItemsBySearch = (items) => {
    if (!itemSearch) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase())
    );
  };

  const accessibleNavItems = getAccessibleNavItems();
  const alwaysVisibleItems = getAlwaysVisibleItems();
  const otherItems = accessibleNavItems.filter(item => !alwaysVisibleItems.includes(item));
  
  const filteredOtherItems = filterItemsBySearch(otherItems);

  return {
    accessibleNavItems,
    alwaysVisibleItems,
    otherItems,
    filteredOtherItems,
  };
};
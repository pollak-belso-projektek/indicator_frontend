import { useSelector } from "react-redux";
import { useGetTableListQuery } from "../store/api/apiSlice";
import {
  selectUserTableAccess,
  selectUserPermissions,
} from "../store/slices/authSlice";
import { canModifyTable, isTableLocked } from "../utils/tableAccessUtils";

/**
 * Hook to check table lock status and modification permissions
 * @param {string} tableName - Name of the table to check
 * @returns {Object} - { isLocked, canModify, lockMessage, isLoading }
 */
export const useTableLockStatus = (tableName) => {
  const { data: tableList = [], isLoading } = useGetTableListQuery();
  const tableAccess = useSelector(selectUserTableAccess);
  console.log("Table list from API:", tableList);
  console.log("User table access from Redux:", tableAccess);
  const userPermissions = useSelector(selectUserPermissions);

  const isSuperadmin = userPermissions?.isSuperadmin || false;
  const locked = isTableLocked(tableList, tableName);
  const modifyResult = canModifyTable(
    tableList,
    tableAccess,
    tableName,
    isSuperadmin
  );

  console.log(
    `useTableLockStatus for table "${tableName}": isLocked=${locked}, canModify=${modifyResult.canModify}, lockMessage=${modifyResult.reason}, isLoading=${isLoading}`
  );
  return {
    isLocked: locked,
    canModify: modifyResult.canModify,
    lockMessage: modifyResult.reason,
    isLoading,
  };
};

/**
 * Hook to check if user can lock/unlock tables
 * @returns {boolean} - True if user can lock/unlock tables
 */
export const useCanLockTables = () => {
  const userPermissions = useSelector(selectUserPermissions);
  return userPermissions?.isHSZC || userPermissions?.isSuperadmin || false;
};

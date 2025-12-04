import React from "react";
import { Tooltip } from "@mui/material";
import { useTableLockStatus } from "../hooks/useTableLock";

/**
 * Wrapper component that disables children when table is locked
 * Shows tooltip with lock message on hover
 * 
 * @param {string} tableName - Name of the table to check
 * @param {React.ReactNode} children - Child component (usually a Button)
 * @param {boolean} disableForNonSuperadmin - If true, disable for non-superadmins even if table isn't locked
 */
const LockedTableWrapper = ({
  tableName,
  children,
  disableForNonSuperadmin = false,
}) => {
  const { isLocked, canModify, lockMessage } = useTableLockStatus(tableName);

  // If table is not locked and user can modify, return children as-is
  if (!isLocked && canModify) {
    return children;
  }

  // Determine the message to show
  const tooltipMessage = isLocked
    ? lockMessage || "Ez a tábla jelenleg le van zárva"
    : "Nincs jogosultságod a módosításhoz";

  // Clone the child element and add disabled prop
  const clonedChild = React.cloneElement(children, {
    disabled: true,
    ...children.props,
  });

  return (
    <Tooltip title={tooltipMessage} arrow>
      <span>{clonedChild}</span>
    </Tooltip>
  );
};

export default LockedTableWrapper;

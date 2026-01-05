import React from "react";
import { Tooltip } from "@mui/material";
import { useTableLockStatus } from "../hooks/useTableLock";

/**
 * Wrapper component that disables children when table is locked
 * Shows tooltip with lock message on hover
 *
 * @param {string} tableName - Name of the table to check
 * @param {React.ReactNode} children - Child component(s) (usually Button(s))
 * @param {boolean} disableForNonSuperadmin - If true, disable for non-superadmins even if table isn't locked
 */
const LockedTableWrapper = ({
  tableName,
  children,
  disableForNonSuperadmin = false,
}) => {
  const { isLocked, canModify, lockMessage } = useTableLockStatus(tableName);

  if (!isLocked && canModify) {
    console.log(
      "Table is not locked and user can modify. Rendering children normally."
    );
    return children;
  }

  console.log(
    `Table is locked: ${isLocked}, User can modify: ${canModify}. Disabling children.`
  );

  // Determine the message to show
  const tooltipMessage = isLocked
    ? lockMessage || "Ez a tábla jelenleg le van zárva"
    : "Nincs jogosultságod a módosításhoz";

  // Helper function to clone a single child with disabled prop
  const disableChild = (child, index) => {
    // Skip non-element children (strings, numbers, null, etc.)
    if (!React.isValidElement(child)) {
      return child;
    }

    // Clone the child element and add disabled prop
    // Note: disabled: true must come AFTER ...child.props to override any existing disabled prop
    const clonedChild = React.cloneElement(child, {
      ...child.props,
      disabled: true,
      key: child.key || index,
    });

    return (
      <Tooltip title={tooltipMessage} arrow key={child.key || index}>
        <span style={{ display: "inline-block" }}>{clonedChild}</span>
      </Tooltip>
    );
  };

  // Handle multiple children
  const childArray = React.Children.toArray(children);

  if (childArray.length === 1) {
    return disableChild(childArray[0], 0);
  }

  // Multiple children - wrap each one
  return <>{childArray.map((child, index) => disableChild(child, index))}</>;
};

export default LockedTableWrapper;

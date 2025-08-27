import React, { useState } from "react";
import { Tooltip, Box } from "@mui/material";
import { useAccessControl } from "../../hooks/useAccessControl";
import NotificationSnackbar from "../shared/NotificationSnackbar";

/**
 * PermissionGate Component
 * 
 * A component that conditionally renders UI elements based on user permissions.
 * Useful for hiding/showing buttons, forms, or other interactive elements.
 * 
 * @param {Object} props
 * @param {string} props.tableName - Table name to check permissions for
 * @param {string} props.action - Required action: 'read', 'create', 'update', 'delete'
 * @param {React.ReactNode} props.children - Content to render if permission granted
 * @param {React.ReactNode} props.fallback - Content to render if permission denied
 * @param {boolean} props.showTooltip - Show tooltip explaining why access is denied
 * @param {string} props.tooltipText - Custom tooltip text
 * @param {boolean} props.disableInsteadOfHide - Disable the element instead of hiding it
 * @param {boolean} props.showNotification - Show snackbar notification when access is denied
 * @param {string} props.notificationMessage - Custom notification message
 * @param {function} props.onAccessDenied - Callback function when access is denied
 */
const PermissionGate = ({
  tableName,
  action = 'read',
  children,
  fallback = null,
  showTooltip = false,
  tooltipText = '',
  disableInsteadOfHide = false,
  showNotification = false,
  notificationMessage = '',
  onAccessDenied
}) => {
  const { hasTableAccess } = useAccessControl();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const hasPermission = hasTableAccess(tableName, action);

  // Generate default messages
  const defaultTooltipText = `Nincs jogosultsága a(z) ${tableName} tábla ${action} műveletéhez`;
  const defaultNotificationMessage = `Hozzáférés megtagadva: ${tableName} tábla ${action} művelet nem engedélyezett`;
  
  const finalTooltipText = tooltipText || defaultTooltipText;
  const finalNotificationMessage = notificationMessage || defaultNotificationMessage;

  // Handle access denied actions
  const handleAccessDenied = () => {
    if (showNotification) {
      setNotificationOpen(true);
    }
    if (onAccessDenied) {
      onAccessDenied(tableName, action);
    }
  };

  // If permission denied
  if (!hasPermission) {
    // Show disabled version with tooltip and handle click
    if (disableInsteadOfHide && showTooltip) {
      return (
        <>
          <Tooltip title={finalTooltipText} arrow>
            <Box component="span" sx={{ display: 'inline-block' }}>
              {React.cloneElement(children, { 
                disabled: true,
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAccessDenied();
                }
              })}
            </Box>
          </Tooltip>
          {showNotification && (
            <NotificationSnackbar
              open={notificationOpen}
              message={finalNotificationMessage}
              severity="warning"
              onClose={() => setNotificationOpen(false)}
              autoHideDuration={5000}
            />
          )}
        </>
      );
    }
    
    // Show disabled version without tooltip but with notification
    if (disableInsteadOfHide) {
      return (
        <>
          {React.cloneElement(children, { 
            disabled: true,
            onClick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAccessDenied();
            }
          })}
          {showNotification && (
            <NotificationSnackbar
              open={notificationOpen}
              message={finalNotificationMessage}
              severity="warning"
              onClose={() => setNotificationOpen(false)}
              autoHideDuration={5000}
            />
          )}
        </>
      );
    }
    
    // Show tooltip for hidden element with click handler for notification
    if (showTooltip && fallback) {
      return (
        <>
          <Tooltip title={finalTooltipText} arrow>
            <Box 
              component="span"
              onClick={showNotification ? handleAccessDenied : undefined}
              sx={{ cursor: showNotification ? 'pointer' : 'default' }}
            >
              {fallback}
            </Box>
          </Tooltip>
          {showNotification && (
            <NotificationSnackbar
              open={notificationOpen}
              message={finalNotificationMessage}
              severity="warning"
              onClose={() => setNotificationOpen(false)}
              autoHideDuration={5000}
            />
          )}
        </>
      );
    }
    
    // Return fallback with potential notification trigger
    if (fallback && showNotification) {
      return (
        <>
          <Box 
            component="span"
            onClick={handleAccessDenied}
            sx={{ cursor: 'pointer' }}
          >
            {fallback}
          </Box>
          <NotificationSnackbar
            open={notificationOpen}
            message={finalNotificationMessage}
            severity="warning"
            onClose={() => setNotificationOpen(false)}
            autoHideDuration={5000}
          />
        </>
      );
    }
    
    // Return fallback or nothing
    return fallback;
  }

  // Permission granted, render children normally
  return children;
};

export default PermissionGate;

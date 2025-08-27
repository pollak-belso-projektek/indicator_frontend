import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { selectUserPermissions, selectUserTableAccess } from "../../store/slices/authSlice";
import NotificationSnackbar from "../shared/NotificationSnackbar";

/**
 * PageAccessControl Component
 * 
 * A reusable component that controls access to pages and CRUD operations
 * based on user permissions and table access rights.
 * 
 * @param {Object} props
 * @param {string} props.tableName - The table name to check permissions for
 * @param {string} props.action - The action to check: 'read', 'create', 'update', 'delete'
 * @param {React.ReactNode} props.children - Content to render if access is granted
 * @param {React.ReactNode} props.fallback - Content to render if access is denied (optional)
 * @param {boolean} props.requiresAuth - Whether authentication is required (default: true)
 * @param {boolean} props.showError - Whether to show error message for denied access (default: false)
 * @param {boolean} props.showNotification - Whether to show snackbar notification for denied access (default: false)
 * @param {string} props.notificationMessage - Custom notification message
 */
const PageAccessControl = ({
  tableName,
  action = 'read',
  children,
  fallback = null,
  requiresAuth = true,
  showError = false,
  showNotification = false,
  notificationMessage = ''
}) => {
  const userPermissions = useSelector(selectUserPermissions);
  const tableAccess = useSelector(selectUserTableAccess);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Check if user has access to the specified table and action
  const hasAccess = () => {
    // If no authentication required, allow access
    if (!requiresAuth) {
      return true;
    }

    // If no permissions available, deny access
    if (!userPermissions) {
      return false;
    }

    // Superadmin and HSZC Admin have access to everything
    if (userPermissions.isSuperadmin || userPermissions.isHSZC) {
      return true;
    }

    // If no table name specified, check general permissions
    if (!tableName) {
      return true; // Allow general access for authenticated users
    }

    // Find specific table access
    const tablePermission = tableAccess?.find(
      (access) => access.tableName === tableName
    );

    if (!tablePermission) {
      return false; // No permission found for this table
    }

    // Map action to permission property
    const actionMap = {
      'read': 'canRead',
      'create': 'canCreate',
      'update': 'canUpdate',
      'delete': 'canDelete'
    };

    const permissionKey = actionMap[action];
    if (!permissionKey) {
      console.warn(`Invalid action: ${action}. Valid actions are: read, create, update, delete`);
      return false;
    }

    return tablePermission.permissions[permissionKey] || false;
  };

  const accessGranted = hasAccess();

  // Generate default notification message
  const defaultNotificationMessage = `Hozzáférés megtagadva: ${tableName ? `${tableName} tábla ${action} művelet` : 'ez az oldal'} nem engedélyezett`;
  const finalNotificationMessage = notificationMessage || defaultNotificationMessage;

  // Show notification when access is denied
  useEffect(() => {
    if (!accessGranted && showNotification) {
      setNotificationOpen(true);
    }
  }, [accessGranted, showNotification]);

  // If access is denied and showError is true, render error message
  if (!accessGranted && showError) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#d32f2f',
        border: '1px solid #f44336',
        borderRadius: '4px',
        backgroundColor: '#ffebee'
      }}>
        <h3>Hozzáférés megtagadva</h3>
        <p>
          Nincs jogosultsága a(z) <strong>{tableName}</strong> tábla{' '}
          <strong>{action}</strong> műveletéhez.
        </p>
        <p>Lépjen kapcsolatba a rendszergazdával a hozzáférés megszerzéséhez.</p>
      </div>
    );
  }

  // If access is denied, render fallback or nothing
  if (!accessGranted) {
    return (
      <>
        {fallback}
        {showNotification && (
          <NotificationSnackbar
            open={notificationOpen}
            message={finalNotificationMessage}
            severity="error"
            onClose={() => setNotificationOpen(false)}
            autoHideDuration={6000}
          />
        )}
      </>
    );
  }

  // Access granted, render children
  return children;
};

export default PageAccessControl;

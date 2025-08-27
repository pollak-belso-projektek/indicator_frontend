import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessNotification } from '../contexts/AccessNotificationContext';

export const useRedirectNotification = () => {
  const location = useLocation();
  const { notifyAccessDenied, notifyInsufficientPermissions } = useAccessNotification();

  useEffect(() => {
    // Check if we were redirected due to access denial
    if (location.state?.redirectReason) {
      const { redirectReason, fromRoute, tableName, requiredRole } = location.state;
      
      switch (redirectReason) {
        case 'table_access_denied':
          notifyAccessDenied(fromRoute, tableName);
          break;
        case 'insufficient_permissions':
          notifyInsufficientPermissions(fromRoute, requiredRole);
          break;
        default:
          break;
      }
      
      // Clear the state to prevent repeated notifications
      if (window.history?.replaceState) {
        window.history.replaceState(
          { ...location.state, redirectReason: null },
          '',
          location.pathname
        );
      }
    }
  }, [location, notifyAccessDenied, notifyInsufficientPermissions]);
};

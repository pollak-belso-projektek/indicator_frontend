import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import { hasTableAccess } from '../utils/tableAccessUtils';
import { useAccessNotification } from '../contexts/AccessNotificationContext';

const TableProtectedRouteWithNotifications = ({ children, requiredTable, requiredAccess = 1 }) => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const { notifyAccessDenied } = useAccessNotification();

  useEffect(() => {
    // Trigger notification on access denial
    if (user && requiredTable) {
      const hasAccess = hasTableAccess(user, requiredTable, requiredAccess);
      
      if (!hasAccess) {
        // Small delay to ensure navigation happens first
        const timer = setTimeout(() => {
          notifyAccessDenied(location.pathname, requiredTable);
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, requiredTable, requiredAccess, location.pathname, notifyAccessDenied]);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check table access for non-superadmin users
  if (user.user_level !== 31 && requiredTable) {
    const hasAccess = hasTableAccess(user, requiredTable, requiredAccess);
    
    if (!hasAccess) {
      console.warn(`Access denied to table ${requiredTable} for user level ${user.user_level}. Required access: ${requiredAccess}, User permissions: ${user.table_permissions[requiredTable] || 0}`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default TableProtectedRouteWithNotifications;

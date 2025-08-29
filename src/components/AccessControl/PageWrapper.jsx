import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Alert, Box, Button, Typography } from "@mui/material";
import { Lock as LockIcon, Home as HomeIcon } from "@mui/icons-material";
import { useAccessControl } from "../../hooks/useAccessControl";
import NotificationSnackbar from "../shared/NotificationSnackbar";

/**
 * PageWrapper Component
 * 
 * A wrapper component that protects entire pages based on table access permissions.
 * This should be used to wrap page components that require specific permissions.
 * 
 * @param {Object} props
 * @param {string} props.tableName - Required table name for the page
 * @param {string} props.requiredAction - Required action permission (default: 'read')
 * @param {React.ReactNode} props.children - The page content to render
 * @param {string} props.redirectTo - Where to redirect if access denied (default: '/dashboard')
 * @param {boolean} props.showErrorPage - Show error page instead of redirecting (default: false)
 * @param {string} props.pageTitle - Title for the error page
 * @param {boolean} props.showNotification - Show snackbar notification when access is denied
 * @param {string} props.notificationMessage - Custom notification message
 */
const PageWrapper = ({
  tableName,
  requiredAction = 'read',
  children,
  redirectTo = '/dashboard',
  showErrorPage = false,
  pageTitle = 'Hozzáférés megtagadva',
  showNotification = false,
  notificationMessage = ''
}) => {
  const { hasTableAccess, isAuthenticated, getHighestRole } = useAccessControl();
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required table access
  const hasAccess = hasTableAccess(tableName, requiredAction);

  // Generate default notification message
  const defaultNotificationMessage = `Hozzáférés megtagadva: ${tableName} oldal megtekintése nem engedélyezett`;
  const finalNotificationMessage = notificationMessage || defaultNotificationMessage;

  // Show notification when access is denied
  useEffect(() => {
    if (!hasAccess && showNotification) {
      setNotificationOpen(true);
    }
  }, [hasAccess, showNotification]);

  if (!hasAccess) {
    // Show error page instead of redirecting
    if (showErrorPage) {
      return (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              p: 3
            }}
          >
            <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
            
            <Typography variant="h4" gutterBottom color="error">
              {pageTitle}
            </Typography>
            
            <Typography variant="h6" gutterBottom color="textSecondary">
              Nincs jogosultsága az oldal megtekintéséhez
            </Typography>
            
            <Alert severity="warning" sx={{ mt: 2, mb: 3, maxWidth: 600 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Szükséges jogosultság:</strong> {tableName} tábla - {requiredAction} művelet
              </Typography>
              <Typography variant="body2">
                <strong>Jelenlegi szerepkör:</strong> {getHighestRole()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                A hozzáférés megszerzéséhez lépjen kapcsolatba a rendszergazdával.
              </Typography>
            </Alert>
            
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => window.location.href = '/dashboard'}
              sx={{ mt: 2 }}
            >
              Vissza a főoldalra
            </Button>
          </Box>
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

    // Redirect to specified location with notification
    if (showNotification) {
      return (
        <>
          <Navigate to={redirectTo} replace />
          <NotificationSnackbar
            open={notificationOpen}
            message={finalNotificationMessage}
            severity="warning"
            onClose={() => setNotificationOpen(false)}
            autoHideDuration={6000}
          />
        </>
      );
    }

    // Redirect to specified location
    return <Navigate to={redirectTo} replace />;
  }

  // Access granted, render the page
  return <>{children}</>;
};

export default PageWrapper;

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useAccessNotification } from '../contexts/AccessNotificationContext';

const AccessTestPage = () => {
  const { notifyAccessDenied, notifyInsufficientPermissions, showNotification } = useAccessNotification();

  const handleTestAccessDenied = () => {
    notifyAccessDenied('/test-route', 'test_table');
  };

  const handleTestInsufficientPermissions = () => {
    notifyInsufficientPermissions('/test-route', 'admin');
  };

  const handleTestGenericNotification = () => {
    showNotification('🧪 Ez egy teszt értesítés!', 'info');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Access Notification System Test
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Ez az oldal az access notification rendszer tesztelésére szolgál.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', maxWidth: 400 }}>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleTestAccessDenied}
          >
            Test Access Denied Notification
          </Button>

          <Button 
            variant="contained" 
            color="warning" 
            onClick={handleTestInsufficientPermissions}
          >
            Test Insufficient Permissions
          </Button>

          <Button 
            variant="contained" 
            color="info" 
            onClick={handleTestGenericNotification}
          >
            Test Generic Notification
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AccessTestPage;

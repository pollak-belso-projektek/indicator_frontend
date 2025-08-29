/**
 * ACCESS CONTROL USAGE EXAMPLES
 * 
 * This file demonstrates how to use the access control components
 * throughout your application.
 */

import React from 'react';
import { Button, TextField, Card, CardContent, Typography } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { 
  PageWrapper, 
  PermissionGate, 
  useAccessControl 
} from '../components/AccessControl';

// ========================================
// 1. PAGE-LEVEL PROTECTION
// ========================================

/**
 * Example: Protecting an entire page with notifications
 */
const TanuloLetszamPage = () => {
  return (
    <PageWrapper 
      tableName="tanulo_letszam" 
      requiredAction="read"
      showErrorPage={true}
      showNotification={true}
      pageTitle="Tanulólétszám oldal"
      notificationMessage="Nincs jogosultsága a tanulólétszám oldal megtekintéséhez!"
    >
      <div>
        <h1>Tanulólétszám kezelése</h1>
        {/* Your page content here */}
      </div>
    </PageWrapper>
  );
};

/**
 * Example: Admin-only page with redirect and notification
 */
const UserManagementPage = () => {
  return (
    <PageWrapper 
      tableName="user" 
      requiredAction="read"
      redirectTo="/dashboard"
      showNotification={true}
      notificationMessage="Csak adminisztrátorok férhetnek hozzá a felhasználó kezeléshez!"
    >
      <div>
        <h1>Felhasználó kezelés</h1>
        {/* Admin content here */}
      </div>
    </PageWrapper>
  );
};

// ========================================
// 2. COMPONENT-LEVEL PROTECTION
// ========================================

/**
 * Example: Protecting specific UI elements with notifications
 */
const DataManagementComponent = () => {
  const handleAccessDenied = (tableName, action) => {
    console.log(`Access denied for ${tableName} - ${action}`);
    // You can add additional logic here like logging or analytics
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Adatok kezelése
        </Typography>
        
        {/* Show data - everyone with read access can see this */}
        <PermissionGate 
          tableName="tanulo_letszam" 
          action="read"
          showNotification={true}
          notificationMessage="Nincs jogosultsága az adatok megtekintéséhez!"
        >
          <Typography>Tanulólétszám adatok megjelenítése...</Typography>
        </PermissionGate>
        
        {/* Create button with notification */}
        <PermissionGate 
          tableName="tanulo_letszam" 
          action="create"
          showTooltip={true}
          showNotification={true}
          notificationMessage="Új adat hozzáadása nem engedélyezett!"
          onAccessDenied={handleAccessDenied}
          fallback={<Button disabled startIcon={<AddIcon />}>Hozzáadás</Button>}
        >
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => console.log('Creating new record')}
          >
            Új adat hozzáadása
          </Button>
        </PermissionGate>
        
        {/* Edit button - disable instead of hide with notification on click */}
        <PermissionGate 
          tableName="tanulo_letszam" 
          action="update"
          disableInsteadOfHide={true}
          showTooltip={true}
          showNotification={true}
          notificationMessage="Adatok szerkesztése nem engedélyezett!"
          onAccessDenied={handleAccessDenied}
        >
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            sx={{ ml: 1 }}
          >
            Szerkesztés
          </Button>
        </PermissionGate>
        
        {/* Delete button with custom notification */}
        <PermissionGate 
          tableName="tanulo_letszam" 
          action="delete"
          showTooltip={true}
          showNotification={true}
          notificationMessage="⚠️ Törlési jogosultság szükséges! Lépjen kapcsolatba a rendszergazdával."
          onAccessDenied={handleAccessDenied}
        >
          <Button 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ ml: 1 }}
          >
            Törlés
          </Button>
        </PermissionGate>
      </CardContent>
    </Card>
  );
};

// ========================================
// 3. HOOK USAGE EXAMPLES
// ========================================

/**
 * Example: Using the hook for complex logic
 */
const DynamicContentComponent = () => {
  const { 
    hasTableAccess, 
    getTablePermissions, 
    hasRole, 
    getHighestRole,
    getAccessibleTables 
  } = useAccessControl();

  // Check specific permissions
  const canReadUsers = hasTableAccess('user', 'read');
  const canCreateCompetition = hasTableAccess('kompetencia', 'create');
  
  // Get all permissions for a table
  const userPermissions = getTablePermissions('user');
  
  // Check roles
  const isSuperadmin = hasRole('superadmin');
  const isAdmin = hasRole('admin');
  
  // Get user's role
  const userRole = getHighestRole();
  
  // Get accessible tables
  const accessibleTables = getAccessibleTables();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Felhasználói információk
        </Typography>
        
        <Typography variant="body2">
          Szerepkör: {userRole}
        </Typography>
        
        <Typography variant="body2">
          Elérhető táblák: {accessibleTables.length}
        </Typography>
        
        {isSuperadmin && (
          <Typography color="primary" variant="body2">
            🔧 Superadmin jogosultságok aktívak
          </Typography>
        )}
        
        {canReadUsers && (
          <Typography variant="body2">
            ✅ Felhasználók megtekintése engedélyezett
          </Typography>
        )}
        
        <Typography variant="body2">
          Felhasználó jogosultságok: 
          {userPermissions.canRead && ' Olvasás'}
          {userPermissions.canCreate && ' Létrehozás'}
          {userPermissions.canUpdate && ' Módosítás'}
          {userPermissions.canDelete && ' Törlés'}
        </Typography>
      </CardContent>
    </Card>
  );
};

// ========================================
// 4. FORM FIELD PROTECTION
// ========================================

/**
 * Example: Protecting form fields based on permissions with notifications
 */
const EditableForm = () => {
  const { hasTableAccess } = useAccessControl();
  
  const canEdit = hasTableAccess('alapadatok', 'update');

  return (
    <form>
      <TextField
        label="Intézmény neve"
        fullWidth
        margin="normal"
        disabled={!canEdit}
        helperText={!canEdit ? "Nincs jogosultsága a szerkesztéshez" : ""}
      />
      
      <PermissionGate 
        tableName="alapadatok" 
        action="update"
        showNotification={true}
        notificationMessage="Alapadatok mentése nem engedélyezett!"
        disableInsteadOfHide={true}
        showTooltip={true}
      >
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Mentés
        </Button>
      </PermissionGate>
    </form>
  );
};

// ========================================
// 6. BATCH OPERATIONS WITH NOTIFICATIONS
// ========================================

/**
 * Example: Batch operations with detailed notifications
 */
const BatchOperationsComponent = () => {
  const { hasTableAccess } = useAccessControl();

  const handleBulkDelete = () => {
    console.log('Bulk delete operation');
  };

  const handleBulkEdit = () => {
    console.log('Bulk edit operation');
  };

  const handleAccessDeniedWithAction = (tableName, action) => {
    // You can add specific logic based on the denied action
    if (action === 'delete') {
      console.log('Delete access denied - maybe suggest alternative action');
    } else if (action === 'update') {
      console.log('Update access denied - maybe redirect to read-only view');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tömeges műveletek
        </Typography>
        
        <PermissionGate
          tableName="tanulo_letszam"
          action="update"
          showNotification={true}
          showTooltip={true}
          notificationMessage="📝 Tömeges szerkesztés nem engedélyezett! Egyedi szerkesztéshez lépjen be az egyes rekordokba."
          onAccessDenied={handleAccessDeniedWithAction}
        >
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleBulkEdit}
            sx={{ mr: 1 }}
          >
            Tömeges szerkesztés
          </Button>
        </PermissionGate>

        <PermissionGate
          tableName="tanulo_letszam"
          action="delete"
          showNotification={true}
          showTooltip={true}
          notificationMessage="🚫 Tömeges törlés szigorúan korlátozott! Csak rendszergazdák számára elérhető."
          onAccessDenied={handleAccessDeniedWithAction}
        >
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
          >
            Tömeges törlés
          </Button>
        </PermissionGate>
      </CardContent>
    </Card>
  );
};

// ========================================
// 5. NAVIGATION MENU PROTECTION
// ========================================

/**
 * Example: Filtering navigation items based on permissions
 */
const DynamicNavigation = () => {
  const { hasTableAccess, hasRole } = useAccessControl();

  const navigationItems = [
    {
      title: 'Alapadatok',
      path: '/alapadatok',
      tableName: 'alapadatok',
      action: 'read'
    },
    {
      title: 'Tanulólétszám',
      path: '/tanulo-letszam',
      tableName: 'tanulo_letszam',
      action: 'read'
    },
    {
      title: 'Kompetenciamérés',
      path: '/kompetencia',
      tableName: 'kompetencia',
      action: 'read'
    },
    {
      title: 'Felhasználók',
      path: '/users',
      tableName: 'user',
      action: 'read',
      requiresAdmin: true
    }
  ];

  const visibleItems = navigationItems.filter(item => {
    // Check admin requirement
    if (item.requiresAdmin && !hasRole('admin') && !hasRole('superadmin')) {
      return false;
    }
    
    // Check table access
    return hasTableAccess(item.tableName, item.action);
  });

  return (
    <nav>
      {visibleItems.map(item => (
        <a key={item.path} href={item.path}>
          {item.title}
        </a>
      ))}
    </nav>
  );
};

export {
  TanuloLetszamPage,
  UserManagementPage,
  DataManagementComponent,
  DynamicContentComponent,
  EditableForm,
  BatchOperationsComponent,
  DynamicNavigation
};

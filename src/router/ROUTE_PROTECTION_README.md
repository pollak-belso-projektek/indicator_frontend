# Route-Level Access Control Documentation

## Overview

This system implements comprehensive route-level access control that prevents users from accessing pages they don't have permissions for, even when accessing URLs directly.

## Components

### 1. ProtectedRoute

Basic authentication protection component.

- **Purpose**: Ensures user is authenticated before accessing any protected route
- **Usage**: For routes that only require authentication (e.g., dashboard)
- **Props**:
  - `children`: The component to render if authenticated
  - `requireTableAccess`: Optional boolean for backwards compatibility

### 2. TableProtectedRoute

Enhanced protection that checks both authentication and table access permissions.

- **Purpose**: Ensures user has specific table access permissions
- **Usage**: For routes that correspond to specific data tables
- **Props**:
  - `children`: The component to render if authorized
  - `tableName`: Optional specific table name (auto-detected from route if not provided)

## Route Configuration

### Protected Routes (Authentication Only)

```jsx
<ProtectedRoute>
  <Navigation>
    <DashboardPage />
  </Navigation>
</ProtectedRoute>
```

- `/dashboard` - Main dashboard (accessible to all authenticated users)
- `/adat-import` - Data import functionality

### Table-Protected Routes (Authentication + Table Access)

```jsx
<TableProtectedRoute>
  <Navigation>
    <AlapadatokPage />
  </Navigation>
</TableProtectedRoute>
```

- `/alapadatok` → `alapadatok` table
- `/tanulo_letszam` → `tanulo_letszam` table
- `/kompetencia` → `kompetencia` table
- `/versenyek` → `versenyek` table
- `/users` → `users` table
- `/tanugyi_adatok` → `tanugyi_adatok` table
- `/felvettek_szama` → `felvettek_szama` table

## Helper Functions (tableValues.js)

### Route-to-Table Mapping

```javascript
const routeToTableMapping = {
  "/alapadatok": "alapadatok",
  "/tanulo_letszam": "tanulo_letszam",
  "/kompetencia": "kompetencia",
  "/versenyek": "versenyek",
  "/tanugyi_adatok": "tanugyi_adatok",
  "/felvettek_szama": "felvettek_szama",
  "/users": "users",
};
```

### Access Control Functions

- `getTableNameFromRoute(route)` - Maps route path to table name
- `hasTableAccess(tableAccess, tableName)` - Checks if user has access to specific table
- `hasRouteAccess(tableAccess, route)` - Checks if user can access specific route
- `getAccessibleRoutes(tableAccess)` - Returns all routes user can access

## Hook: useRouteAccess

Provides centralized access control logic for components:

```javascript
const { canAccessRoute, canAccessTable, accessibleRoutes } = useRouteAccess();

// Check specific route access
if (canAccessRoute("/alapadatok")) {
  // User can access this route
}

// Check table access
if (canAccessTable("users")) {
  // User can access users table
}

// Get all accessible routes
console.log(accessibleRoutes); // ['/dashboard', '/alapadatok', '/users', ...]
```

## Security Flow

1. **URL Access**: User types URL directly or clicks link
2. **Authentication Check**: `ProtectedRoute` or `TableProtectedRoute` checks if user is authenticated
3. **Table Access Check**: `TableProtectedRoute` determines required table from route
4. **Permission Validation**: Checks user's JWT table access array
5. **Access Decision**:
   - **Granted**: Renders requested component
   - **Denied**: Redirects to `/dashboard` with console warning

## JWT Table Access Format

The system expects table access in the JWT payload:

```json
{
  "tableAccess": [
    {
      "tableName": "alapadatok",
      "access": "read",
      "permissionsDetails": {}
    },
    {
      "tableName": "users",
      "access": "write",
      "permissionsDetails": {}
    }
  ]
}
```

## Integration with Navigation

The sidebar navigation automatically filters menu items based on table access:

- Only shows links for tables user can access
- Provides visual consistency with route protection
- Prevents users from seeing links they can't use

## Error Handling

- **Unauthorized Access**: Redirects to dashboard with console warning
- **Invalid Routes**: Fallback to dashboard or login
- **Missing Permissions**: Graceful handling with default deny

## Future Enhancements

1. **Granular Permissions**: Support for read/write/admin level access within routes
2. **Dynamic Route Loading**: Load routes based on user permissions
3. **Access Logging**: Track unauthorized access attempts
4. **Custom Error Pages**: Specific pages for access denied scenarios

## Testing Route Protection

To test the route protection:

1. **Direct URL Access**: Try accessing URLs directly in browser
2. **Permission Changes**: Modify user permissions and test access
3. **Token Expiry**: Test behavior when tokens expire
4. **Invalid Routes**: Test with non-existent routes

The system should gracefully handle all scenarios with appropriate redirects and logging.

## Superadmin Override

**Important**: Superadmins (`userPermissions.isSuperadmin === true`) bypass ALL permission checks:

- **Route Access**: Can access any route regardless of table permissions
- **Navigation**: See all menu items in sidebar
- **Table Access**: Can access any table/data
- **User Management**: Already had full permissions

### Implementation Details

The Superadmin bypass is implemented at multiple levels:

1. **`useRouteAccess` Hook**:

   - `canAccessRoute()` returns `true` for all routes
   - `canAccessTable()` returns `true` for all tables
   - `accessibleRoutes` includes all available routes

2. **Route Protection Components**:

   - `TableProtectedRoute`: Early return if `isSuperadmin`
   - `ProtectedRoute`: Early return if `isSuperadmin`

3. **Navigation Filtering**:

   - `getAccessibleNavItems()` returns all items if `isSuperadmin`

4. **Helper Functions**:
   - `hasRouteAccess()` accepts optional `isSuperadmin` parameter
   - `getAccessibleRoutes()` returns all routes if `isSuperadmin`

### Security Flow (Updated)

1. **URL Access**: User types URL directly or clicks link
2. **Authentication Check**: Verify user is authenticated
3. **Superadmin Check**: If `isSuperadmin`, grant immediate access
4. **Table Access Check**: For non-superadmins, check table permissions
5. **Access Decision**: Grant/deny based on permissions

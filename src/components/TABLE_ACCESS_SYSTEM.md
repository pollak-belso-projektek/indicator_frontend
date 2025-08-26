# Table Access System Documentation

## Overview

The table access system uses bitwise operations to manage granular permissions for each table. Each permission has a specific bit value that can be combined to create different access levels.

**Related Documentation**: See [TABLE_MANAGEMENT_README.md](./TABLE_MANAGEMENT_README.md) for information about creating and managing tables.

## Permission Values

```javascript
TABLE_ACCESS_LEVELS = {
  NONE: 0, // No access
  READ: 1, // Binary: 0001
  WRITE: 2, // Binary: 0010
  UPDATE: 4, // Binary: 0100
  DELETE: 8, // Binary: 1000
  FULL: 15, // Binary: 1111 (READ + WRITE + UPDATE + DELETE)
};
```

## Permission Combinations

The access level is calculated by summing the individual permission values:

- **READ only**: `1` (0001)
- **READ + WRITE**: `3` (0011)
- **READ + UPDATE**: `5` (0101)
- **READ + DELETE**: `9` (1001)
- **WRITE + UPDATE**: `6` (0110)
- **READ + WRITE + UPDATE**: `7` (0111)
- **READ + WRITE + DELETE**: `11` (1011)
- **Full access**: `15` (1111)

## API Format

When creating or updating users, the `tableAccess` array should follow this format:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123",
  "permissions": 1,
  "tableAccess": [
    {
      "tableName": "kompetencia",
      "access": 7
    },
    {
      "tableName": "tanulo_letszam",
      "access": 3
    }
  ],
  "alapadatok_id": 1
}
```

### Example Explanations:

**Table: kompetencia (access: 7)**

- Binary: `0111`
- Permissions: READ (1) + WRITE (2) + UPDATE (4) = 7
- User can read, write, and update, but not delete

**Table: tanulo_letszam (access: 3)**

- Binary: `0011`
- Permissions: READ (1) + WRITE (2) = 3
- User can read and write, but not update or delete

## UI Components

### CreateUserDialog

- Select tables from available list
- For each table, choose individual permissions (checkboxes)
- Real-time calculation of access level
- Visual feedback showing current permissions

### TablePermissionsDisplay

- Shows existing user permissions in readable format
- Color-coded chips for different access levels
- Binary representation for debugging

## Utility Functions

### calculateAccessLevel(selectedPermissions)

Converts array of permission keys to numeric access level:

```javascript
calculateAccessLevel(["READ", "WRITE", "UPDATE"]); // Returns 7
```

### formatAccessLevel(accessLevel)

Converts numeric access level to human-readable permission names:

```javascript
formatAccessLevel(7); // Returns ['Olvasás', 'Írás', 'Módosítás']
```

### hasTablePermission(tableAccess, tableName, requiredLevel)

Checks if user has specific permission on a table:

```javascript
hasTablePermission(userTableAccess, "kompetencia", TABLE_ACCESS_LEVELS.WRITE); // Returns boolean
```

## Usage Examples

### Checking Permissions in Components

```javascript
import {
  hasTablePermission,
  TABLE_ACCESS_LEVELS,
} from "../utils/tableAccessUtils";

const canEditTable = hasTablePermission(
  user.tableAccess,
  "kompetencia",
  TABLE_ACCESS_LEVELS.WRITE
);

const canDeleteFromTable = hasTablePermission(
  user.tableAccess,
  "tanulo_letszam",
  TABLE_ACCESS_LEVELS.DELETE
);
```

### Creating User with Custom Permissions

```javascript
const newUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  permissions: 1,
  tableAccess: [
    {
      tableName: "kompetencia",
      access: calculateAccessLevel(["READ", "write"]), // Results in 3
    },
    {
      tableName: "tanulo_letszam",
      access: TABLE_ACCESS_LEVELS.FULL, // Results in 15
    },
  ],
};
```

## Best Practices

1. **Always validate permissions** before allowing operations
2. **Use bitwise checks** for efficient permission testing
3. **Default to minimal permissions** (READ only) for new tables
4. **Provide clear UI feedback** showing current permission levels
5. **Log permission changes** for audit purposes

## Table Management Integration

Tables are managed through the **Table Management System** (`/table-management`):

- **Superadmins** can create new tables via the admin interface
- Tables created there automatically appear in user permission dialogs
- Table availability can be toggled without affecting existing permissions
- Real-time integration between table creation and user assignment

## Security Considerations

- Superadmin bypasses all table-level permissions
- Permission checks should happen both client and server-side
- Use TABLE_ACCESS_LEVELS constants instead of magic numbers
- Validate that permission combinations make logical sense (e.g., WRITE usually requires READ)

## Migration Notes

When updating existing users:

- Default existing table access to FULL (15) to maintain compatibility
- Provide migration scripts to convert old permission formats
- Allow administrators to bulk update permissions as needed

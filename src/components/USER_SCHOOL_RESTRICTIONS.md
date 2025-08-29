# School Selection Restrictions for User Management

## Overview

This update implements proper school selection restrictions for user management based on user hierarchy levels. The system now enforces that only Superadmin and HSZC users can select schools when creating/editing users, while Iskolai users are restricted to their own school.

## Changes Made

### 1. CreateUserDialog.jsx

- **Added school selection restriction logic**: Only Superadmin and HSZC Admin/Privileged users can select schools
- **Automatic school assignment**: Iskolai users automatically have their own school assigned to new users
- **Conditional UI rendering**: School selection field is hidden for Iskolai users, replaced with informational display
- **Enhanced validation**: Added validation to ensure Iskolai users only create users for their own school

### 2. UserDialogs.jsx (EditUserDialog)

- **Added same school selection restrictions** as CreateUserDialog
- **Read-only school display**: Iskolai users see the school assignment but cannot change it
- **Enhanced validation**: Added validation to prevent Iskolai users from editing users outside their school
- **Improved security**: Ensures Iskolai admins can only manage users from their own institution

### 3. useUserPermissions.js Hook

- **Enhanced permission methods**: Updated `canModifyUser` and `canDeactivateUser` to accept target user parameter
- **School-based validation**: Added logic to check if users belong to the same school
- **New method**: Added `canSelectSchoolForUsers()` method for UI conditional rendering
- **Improved security**: Ensures proper permission checking at the hook level

## User Hierarchy Permissions

### Superadmin (Level 31)

- ✅ Can select any school when creating/editing users
- ✅ Can create/edit users for any school
- ✅ Can manage all user types

### HSZC Admin/Privileged (Level 15/10)

- ✅ Can select any school when creating/editing users
- ✅ Can create/edit users for any school
- ✅ Can manage HSZC and Iskolai user types

### Iskolai Admin/Privileged (Level 4/2)

- ❌ Cannot select schools - restricted to their own school
- ✅ Can create/edit users only for their own school
- ✅ Can manage only Iskolai user types
- 🔒 School selection field is hidden and automatically set

### Iskolai General (Level 1)

- ❌ Cannot create or edit users
- ❌ No access to user management functions

## UI Changes

### For Superadmin/HSZC Users

- Full school selection dropdown remains available
- Can select any school from the list
- All existing functionality preserved

### For Iskolai Users

- School selection dropdown is hidden
- Replaced with informational box showing:
  - "Az új felhasználó automatikusan az Ön iskolájához lesz hozzárendelve"
  - Current school name and type
- Read-only display for editing existing users

## Security Enhancements

1. **Frontend Validation**: UI prevents unauthorized school selection
2. **Hook-Level Validation**: Permission checks at the service layer
3. **Dialog-Level Validation**: Final validation before save operations
4. **School Matching**: Ensures Iskolai users can only manage same-school users

## Implementation Details

### School ID Handling

The system properly handles both object and primitive school ID formats:

```javascript
const schoolId =
  typeof currentUser.school === "object"
    ? currentUser.school.id
    : currentUser.school;
```

### Conditional Rendering

Uses `canSelectSchoolForUsers` flag to determine UI rendering:

```javascript
const canSelectSchoolForUsers =
  userPermissions?.isSuperadmin ||
  (userPermissions?.isHSZC && userPermissions?.isAdmin);
```

### Automatic School Assignment

For Iskolai users, the school is automatically set on dialog open:

```javascript
useEffect(() => {
  if (open && !canSelectSchoolForUsers && currentUser?.school) {
    setNewUser((prev) => ({
      ...prev,
      alapadatokId: schoolId,
    }));
  }
}, [open, canSelectSchoolForUsers, currentUser?.school]);
```

## Testing Considerations

1. **Superadmin Testing**: Verify full school selection functionality
2. **HSZC User Testing**: Verify multi-school management capabilities
3. **Iskolai Admin Testing**: Verify restriction to own school only
4. **Permission Validation**: Test unauthorized access attempts
5. **School Assignment**: Verify automatic school assignment for Iskolai users

This implementation ensures proper security boundaries while maintaining a user-friendly interface appropriate for each user's permission level.

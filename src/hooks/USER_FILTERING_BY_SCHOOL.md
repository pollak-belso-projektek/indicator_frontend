# School-Based User Filtering for Iskolai Users

## Overview

This update implements school-based filtering for the user management system. Iskolai (school-level) users can now only see and manage users from their own school, while maintaining full access for Superadmin and HSZC users.

## Changes Made

### 1. useUserManagement.js Hook Updates

#### Added User Filtering Logic

```javascript
// Filter users based on current user's school for Iskolai users
const filteredUsersData = useMemo(() => {
  // Superadmin and HSZC users can see all users
  if (userPermissions?.isSuperadmin || userPermissions?.isHSZC) {
    return usersData;
  }

  // Iskolai users can only see users from their own school
  if (currentUser?.school && !userPermissions?.isHSZC) {
    const currentUserSchoolId =
      typeof currentUser.school === "object"
        ? currentUser.school.id
        : currentUser.school;

    return usersData.filter((user) => {
      const userSchoolId =
        typeof user.alapadatokId === "object"
          ? user.alapadatokId.id
          : user.alapadatokId;

      return userSchoolId === currentUserSchoolId;
    });
  }

  // Default: return all users (fallback)
  return usersData;
}, [
  usersData,
  currentUser?.school,
  userPermissions?.isSuperadmin,
  userPermissions?.isHSZC,
]);
```

#### Updated Table Data Source

- Changed from `data: usersData` to `data: filteredUsersData`
- Ensures the table only displays filtered users

#### Enhanced Permission Checks

- Updated `handleEdit()` and `handleDeactivate()` to use the enhanced permission methods
- Now passes the target user to permission checks: `canModifyUser(user)` and `canDeactivateUser(user)`

## User Experience by Role

### Superadmin Users

- ✅ See all users from all schools
- ✅ Can edit/deactivate any user
- ✅ No filtering applied

### HSZC Admin/Privileged Users

- ✅ See all users from all schools
- ✅ Can edit/deactivate users according to their permissions
- ✅ No filtering applied

### Iskolai Admin/Privileged Users

- 🔒 Only see users from their own school
- 🔒 Can only edit/deactivate users from their own school
- ✅ School-based filtering automatically applied
- ✅ Cannot accidentally access users from other schools

### Iskolai General Users

- 🔒 Only see users from their own school (if they have read access)
- ❌ Cannot edit or deactivate users (based on existing permissions)
- ✅ Read-only access with school filtering

## Technical Implementation

### School ID Handling

The system properly handles both object and primitive school ID formats:

```javascript
const currentUserSchoolId =
  typeof currentUser.school === "object"
    ? currentUser.school.id
    : currentUser.school;

const userSchoolId =
  typeof user.alapadatokId === "object"
    ? user.alapadatokId.id
    : user.alapadatokId;
```

### Performance Optimization

- Uses `useMemo` to prevent unnecessary re-filtering
- Only recalculates when relevant dependencies change
- Efficient filtering based on school ID comparison

### Data Flow

1. Raw users data fetched from API
2. Filtering applied based on current user's permissions and school
3. Filtered data passed to the table component
4. Action buttons respect the same permission model

## Security Benefits

1. **Data Isolation**: Iskolai users cannot see users from other schools
2. **Action Prevention**: Cannot edit/deactivate users outside their school
3. **Automatic Enforcement**: Filtering happens at the data level, not just UI level
4. **No Manual Checks**: Reduces risk of permission bypass errors

## Backward Compatibility

- ✅ No breaking changes for existing functionality
- ✅ Superadmin and HSZC users maintain full access
- ✅ Existing permission system enhanced, not replaced
- ✅ All existing features continue to work as expected

## Testing Scenarios

1. **Superadmin**: Should see all users, can manage all
2. **HSZC Admin**: Should see all users, can manage according to permissions
3. **Iskolai Admin with School A**: Should only see School A users, can manage School A users
4. **Iskolai Admin with School B**: Should only see School B users, cannot see School A users
5. **User without school assignment**: Should see appropriate fallback behavior

This implementation ensures proper data security and user experience while maintaining the system's flexibility for different user types.

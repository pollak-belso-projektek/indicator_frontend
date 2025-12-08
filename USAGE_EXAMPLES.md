# Usage Examples for Table Locking and Alias Mode Features

## Table Lock Status Indicator - Usage Example

### Option 1: Using LockStatusIndicator Component

In a Table Page Component:

```jsx
import { Box, Typography, Button } from "@mui/material";
import LockStatusIndicator from "../components/LockStatusIndicator";
import { useTableLockStatus } from "../hooks/useTableLock";

export default function TanuloLetszam() {
  const { isLocked, canModify, lockMessage } = useTableLockStatus("tanulo_letszam");

  const handleSave = () => {
    if (!canModify) {
      // Show error message
      alert(lockMessage);
      return;
    }
    // Proceed with save
    // ...
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tanulólétszám
      </Typography>
      
      {/* Show lock status banner */}
      <LockStatusIndicator tableName="tanulo_letszam" />
      
      {/* Your form/table content */}
      
      {/* Save button - disabled if table is locked */}
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={isLocked}
      >
        Mentés
      </Button>
    </Box>
  );
}
```

### Option 2: Using LockedTableWrapper (Recommended for Buttons)

This automatically disables buttons and shows a tooltip when table is locked:

```jsx
import { Box, Typography, Button } from "@mui/material";
import LockStatusIndicator from "../components/LockStatusIndicator";
import LockedTableWrapper from "../components/LockedTableWrapper";

export default function TanuloLetszam() {
  const handleSave = () => {
    // Save logic - only called if table is not locked
    // ...
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tanulólétszám
      </Typography>
      
      {/* Show lock status banner */}
      <LockStatusIndicator tableName="tanulo_letszam" />
      
      {/* Your form/table content */}
      
      {/* Save button - automatically disabled with tooltip if locked */}
      <LockedTableWrapper tableName="tanulo_letszam">
        <Button variant="contained" onClick={handleSave}>
          Mentés
        </Button>
      </LockedTableWrapper>
    </Box>
  );
}
```

### As a Chip in Navigation or Header

```jsx
import LockStatusIndicator from "../components/LockStatusIndicator";

// In your navigation or header component
<LockStatusIndicator tableName="tanulo_letszam" showChip={true} />
```

## Table Management - Lock/Unlock Tables

### For HSZC Users and Superadmins

1. Navigate to `/table-management` page
2. Find the table you want to lock/unlock
3. Click the lock icon (🔒) to lock or unlock icon (🔓) to unlock
4. Confirmation notification will appear

### Programmatic Check

```jsx
import { useCanLockTables } from "../hooks/useTableLock";

function MyComponent() {
  const canLockTables = useCanLockTables();

  if (canLockTables) {
    return <LockUnlockButtons />;
  }
  
  return null;
}
```

## Alias Mode - Superadmin Impersonation

### How to Use Alias Mode

1. **Login as Superadmin**
   - You must be logged in with Superadmin privileges

2. **Navigate to Dashboard**
   - Go to the main Dashboard page

3. **Click "Alias mód" Button**
   - Look for the button in the top-right area of the dashboard header
   - It has a supervisor icon (👥)

4. **Select User to Impersonate**
   - A dialog will open showing all users
   - Search by name, email, or school
   - Click on a user to select them
   - Click "Alias mód indítása" to confirm

5. **Navigate as That User**
   - The page will reload with the selected user's permissions
   - An orange banner appears at the top showing:
     - Current impersonated user
     - Original superadmin account
   - All navigation, tables, and features are filtered by the alias user's permissions

6. **Exit Alias Mode**
   - Click "Kilépés az alias módból" button in the orange banner
   - You'll return to your normal Superadmin view

### Visual Indicators in Alias Mode

- **Orange Warning Banner**: Always visible at the top of the page
  ```
  ⚠️ Alias mód aktív
  Az oldalt {user name} ({user email}) felhasználóként látod.
  Eredeti fiók: {superadmin name} (Superadmin)
  [Kilépés az alias módból]
  ```

- **Dashboard Button**: Only visible to Superadmins when NOT in alias mode
- **User Permissions**: All features respect the alias user's permissions

### Use Cases

1. **Debugging User Issues**
   - User reports they can't see a certain table
   - Use alias mode to view the app exactly as they see it
   - Verify their permissions are correct

2. **Testing Permission Configurations**
   - Created a new user with specific permissions
   - Use alias mode to verify they can access what they should

3. **Support and Training**
   - Help a user navigate the system
   - See exactly what they see without needing their password

## Redux State Access

### Check if in Alias Mode

```jsx
import { useSelector } from "react-redux";
import { selectIsInAliasMode, selectAliasUser, selectOriginalUser } from "../store/slices/authSlice";

function MyComponent() {
  const isInAliasMode = useSelector(selectIsInAliasMode);
  const aliasUser = useSelector(selectAliasUser);
  const originalUser = useSelector(selectOriginalUser);

  if (isInAliasMode) {
    console.log(`Viewing as: ${aliasUser.name}`);
    console.log(`Original user: ${originalUser.name}`);
  }

  // Your component logic
}
```

### Enable/Disable Alias Mode Programmatically

```jsx
import { useDispatch } from "react-redux";
import { enableAliasMode, disableAliasMode } from "../store/slices/authSlice";

function MyComponent() {
  const dispatch = useDispatch();

  const handleEnableAlias = (user) => {
    dispatch(enableAliasMode(user));
  };

  const handleDisableAlias = () => {
    dispatch(disableAliasMode());
  };

  // Your component logic
}
```

## Security Notes

### Table Locking
- ✅ Only HSZC users (level 9+) and Superadmins can lock/unlock tables
- ✅ Locked tables cannot be modified by any user except Superadmins
- ✅ Lock status is checked on both frontend and backend
- ⚠️ Backend validation must be implemented for full security

### Alias Mode
- ✅ Only Superadmins (level 31) can enter alias mode
- ✅ Alias mode uses the selected user's exact permissions
- ✅ Visual banner always visible when in alias mode
- ✅ Easy exit mechanism always available
- ⚠️ Backend logging should track all alias mode usage
- ⚠️ Consider adding time limits for alias sessions
- ⚠️ Backend should prevent critical operations in alias mode

## Testing Checklist

### Table Locking
- [ ] Login as Iskolai Admin - should NOT see lock buttons
- [ ] Login as HSZC General - should see lock buttons
- [ ] Lock a table as HSZC user
- [ ] Try to edit locked table as different user - should be blocked
- [ ] Unlock table as HSZC user
- [ ] Edit unlocked table - should work
- [ ] Login as Superadmin - should be able to edit locked tables

### Alias Mode
- [ ] Login as Superadmin - should see "Alias mód" button
- [ ] Click button - dialog should open with user list
- [ ] Search for a user by name - should filter results
- [ ] Select an Iskolai Admin user - alias mode should activate
- [ ] Check navigation menu - should only show tables accessible to that user
- [ ] Check table pages - should only show data for that user's school
- [ ] Try to access admin features - should be blocked
- [ ] Click "Kilépés az alias módból" - should return to Superadmin view
- [ ] Login as non-Superadmin - should NOT see "Alias mód" button

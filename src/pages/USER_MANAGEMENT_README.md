# User Management with TanStack Table

## Overview
The Users.jsx component implements a comprehensive user management system using TanStack Table for data presentation and RTK Query for CRUD operations.

## Features

### 🔧 CRUD Operations
- **Create**: Add new users with form validation
- **Read**: Display users in a sortable, filterable table
- **Update**: Edit existing user information
- **Delete**: Remove users with confirmation

### 📊 Table Features
- **Sorting**: Click column headers to sort data
- **Filtering**: Global search across all columns
- **Pagination**: Navigate through pages with controls
- **Responsive**: Adapts to different screen sizes

### 🎯 User Fields
- **ID**: Unique identifier
- **Name**: Full name of the user
- **Email**: Email address
- **Role**: User role (user, moderator, admin)
- **Status**: Account status (active, inactive)
- **Permissions**: Placeholder for future implementation

## API Integration

The component uses RTK Query hooks from `apiSlice.js`:

```javascript
// Query hooks
useGetUsersQuery()          // Fetch all users
useGetUserByIdQuery(id)     // Fetch specific user

// Mutation hooks
useAddUserMutation()        // Create new user
useUpdateUserMutation()     // Update existing user
useDeleteUserMutation()     // Delete user
```

## API Endpoints

The following endpoints are expected on the backend:

```
GET    /api/v1/users/       - Get all users
GET    /api/v1/users/:id    - Get user by ID
POST   /api/v1/users/       - Create new user
PUT    /api/v1/users/:id    - Update user
DELETE /api/v1/users/:id    - Delete user
```

## User Data Structure

```javascript
{
  id: number,
  name: string,
  email: string,
  role: 'user' | 'moderator' | 'admin',
  status: 'active' | 'inactive',
  permissions: array // For future implementation
}
```

## Permissions System

The permissions system is prepared for future implementation:

- **UI Placeholder**: Shows "To be implemented" message
- **Form Field**: Includes permissions field in the modal
- **Data Structure**: Permissions array is included in user data
- **Ready for Extension**: Easy to add permission selection UI

### Future Permissions Implementation Ideas:
- Role-based permissions matrix
- Granular permissions (read, write, delete for specific resources)
- Permission groups/templates
- Inheritance from roles

## Usage

```jsx
import Users from './pages/Users';

// The component handles all user management internally
<Users />
```

## Dependencies

- `@tanstack/react-table` - Table functionality
- `@chakra-ui/react` - UI components
- `@reduxjs/toolkit` - State management
- `react-icons/fi` - Icons

## Error Handling

- Loading states with spinners
- Error alerts for failed operations
- Toast notifications for success/error feedback
- Form validation

## Responsive Design

The table is wrapped in a `TableContainer` for horizontal scrolling on smaller screens, ensuring usability across all device sizes.

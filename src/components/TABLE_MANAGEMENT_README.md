# Table Management System Documentation

## Overview

The table management system allows superadmins to create and manage database tables that can be assigned to users through the table access system.

## Features

### Table Creation

- Create new tables with name and availability status
- Automatic timestamp tracking for creation and updates
- Validation for table names

### Table Management

- View all available tables in a structured table format
- Edit existing table properties (name and availability)
- Toggle table availability without deletion

### Integration with User Management

- Tables created here automatically appear in user permission dialogs
- Granular permission assignment (READ, WRITE, UPDATE, DELETE)
- Bitwise permission calculation for efficient access control

## API Endpoints

The system uses the following endpoints:

### GET /tablelist

Returns an array of all tables:

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "tanugyi_adatok",
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T12:30:00.000Z"
  }
]
```

### POST /tablelist

Create a new table:

```json
{
  "name": "new_table",
  "isAvailable": true
}
```

### PUT /tablelist/{id}

Update an existing table:

```json
{
  "name": "updated_table",
  "isAvailable": false
}
```

## Components

### TableManagement.jsx

Main component for table management interface:

- Table listing with full details
- Create/Edit dialogs
- Error handling and loading states
- Responsive design

### TableManagementPage.jsx

Simple wrapper page component for routing

## Access Control

### Permissions Required

- Only **Superadmins** can access table management
- Available in Dashboard quick access and Admin navigation menu

### Routes

- Main route: `/table-management`
- Protected by `TableProtectedRoute`
- Listed in public routes (superadmin bypass)

## Navigation Integration

The table management is integrated into:

1. **Dashboard Quick Access** - For superadmins only
2. **Admin Navigation Menu** - Under "Adminisztráció" section
3. **Route Protection** - Automatic access control

## Table Access System Integration

When tables are created/updated here:

- They automatically appear in user creation/editing dialogs
- Users can be assigned granular permissions (READ, WRITE, UPDATE, DELETE)
- Permissions are calculated using bitwise operations for efficiency
- Real-time permission level calculation and display

## Usage Workflow

1. **Superadmin** accesses table management via Dashboard or Navigation
2. **View** existing tables with their current status
3. **Create** new tables by clicking "Új tábla" button
4. **Edit** tables by clicking the edit icon in the table row
5. **Manage availability** by toggling the isAvailable switch
6. **Assign to users** via the user management system

## Error Handling

- Input validation for table names
- API error display with user-friendly messages
- Loading states during operations
- Confirmation for destructive actions

## Future Enhancements

- Table deletion functionality
- Bulk operations
- Table usage statistics
- Permission templates
- Import/export table definitions

## Technical Notes

- Uses RTK Query for API state management
- Material-UI components for consistent styling
- Responsive design for mobile compatibility
- Real-time updates via cache invalidation

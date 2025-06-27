# Token Validation System

This document describes the token validation and automatic logout system implemented in the application.

## Overview

The token validation system ensures that users are automatically logged out when their JWT access tokens expire, providing a secure and seamless user experience.

## Components

### 1. Auth Slice Updates (`src/store/slices/authSlice.js`)

**New Utility Functions:**

- `isTokenExpired(token)` - Checks if a JWT token is expired (with 30-second buffer)
- `isTokenValid(token)` - Checks if a JWT token is valid and not expired

**New Actions:**

- `checkTokenValidity` - Validates current access token and logs out user if expired

**New Selectors:**

- `selectIsTokenValid` - Returns true if current token is valid
- `selectIsTokenExpired` - Returns true if current token is expired

### 2. TokenValidationGuard (`src/components/TokenValidationGuard.jsx`)

A React component that automatically checks token validity in two scenarios:

**Route Change Validation:**

- Checks token validity whenever the user navigates to a new route
- Automatically logs out users with expired tokens

**Periodic Validation:**

- Runs token validation every 5 minutes while user is authenticated
- Provides background protection against token expiration

**Usage:**

```jsx
<TokenValidationGuard>
  <YourAppRoutes />
</TokenValidationGuard>
```

### 3. useTokenValidation Hook (`src/hooks/useTokenValidation.js`)

A custom React hook providing token validation utilities:

**Methods:**

- `validateToken()` - Manually trigger token validation
- `forceLogout()` - Force user logout
- `getTokenExpiration()` - Get token expiration date
- `getTimeUntilExpiration()` - Get milliseconds until token expires

**Properties:**

- `isAuthenticated` - Current authentication status
- `isTokenValid` - Current token validity status
- `isTokenExpired` - Current token expiration status

**Usage:**

```jsx
const { isTokenExpired, validateToken } = useTokenValidation();

useEffect(() => {
  if (isTokenExpired) {
    validateToken();
  }
}, [isTokenExpired]);
```

### 4. Enhanced Protected Routes

Both `ProtectedRoute` and `TableProtectedRoute` components now include token validation:

- Check token expiration before allowing access
- Automatically redirect to login if token is expired
- Trigger token validation for expired tokens

## Integration

### Router Integration

The `TokenValidationGuard` is integrated at the router level:

```jsx
<BrowserRouter>
  <TokenValidationGuard>
    <Routes>{/* All routes */}</Routes>
  </TokenValidationGuard>
</BrowserRouter>
```

### API Integration

The existing `baseQueryWithReauth` continues to handle:

- Automatic token refresh on API 401 errors
- Fallback logout if refresh fails
- Seamless token updates

## Security Features

### Multi-Layer Protection

1. **Route-based validation** - Checks on every navigation
2. **Periodic validation** - Background checks every 5 minutes
3. **API-level validation** - Automatic refresh/logout on API errors
4. **Component-level validation** - Manual validation in protected routes

### Token Expiration Buffer

- Uses 30-second buffer to handle clock differences between client/server
- Prevents edge cases where tokens expire between validation and API calls

### Automatic Cleanup

- Removes all user data and tokens on expiration
- Redirects to login page with appropriate error message
- Preserves intended destination for post-login redirect

## Usage Examples

### Manual Token Validation in Components

```jsx
import { useTokenValidation } from "../hooks/useTokenValidation";

function MyComponent() {
  const { isTokenExpired, validateToken } = useTokenValidation();

  const handleSensitiveAction = () => {
    if (isTokenExpired) {
      validateToken();
      return;
    }
    // Proceed with action
  };
}
```

### Getting Token Expiration Info

```jsx
const { getTokenExpiration, getTimeUntilExpiration } = useTokenValidation();

const expiration = getTokenExpiration();
const timeLeft = getTimeUntilExpiration();

console.log(`Token expires at: ${expiration}`);
console.log(`Time until expiration: ${timeLeft}ms`);
```

## Error Handling

### Token Validation Errors

- Invalid tokens are treated as expired
- Parsing errors result in automatic logout
- Console warnings for debugging

### Network Errors

- API token refresh handles network failures
- Falls back to logout if refresh is unavailable
- Maintains user session when possible

## Configuration

### Validation Intervals

The periodic validation runs every 5 minutes by default. To modify:

```jsx
// In TokenValidationGuard.jsx
const intervalId = setInterval(() => {
  // validation logic
}, 5 * 60 * 1000); // Change this value
```

### Token Expiration Buffer

The 30-second buffer can be adjusted in `authSlice.js`:

```javascript
// In isTokenExpired function
return decoded.exp < currentTime + 30; // Change buffer here
```

## Debugging

### Console Logging

The system includes comprehensive logging:

- Route change validations
- Periodic validation checks
- Token expiration warnings
- Automatic logout triggers

### Redux DevTools

Monitor token validation state changes:

- `checkTokenValidity` action dispatch
- Authentication state updates
- Error state changes

## Best Practices

1. **Always use protected routes** for authenticated pages
2. **Check token validity** before sensitive operations
3. **Handle logout gracefully** in component cleanup
4. **Monitor console warnings** for token issues
5. **Test token expiration scenarios** during development

## Security Considerations

- Tokens are stored in Redux state (memory) not localStorage
- Automatic cleanup prevents stale authentication
- Multiple validation layers provide defense in depth
- Refresh token handling maintains security best practices

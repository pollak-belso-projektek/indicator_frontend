# Token Refresh System - Implementation Guide

## Overview

The token refresh system has been completely redesigned to handle automatic token refresh when access tokens expire, preventing unnecessary user logouts when the refresh token is still valid.

## Components

### 1. Enhanced Auth Slice (`authSlice.js`)

**Key Changes:**

- `checkTokenValidity`: Now only logs out users if both access and refresh tokens are expired
- `refreshTokenSuccess`: Properly handles refresh token responses and updates user data
- New selector: `selectIsTokenExpiringSoon` - detects tokens expiring within 5 minutes
- Improved token validation with proper buffer times

**Important Functions:**

- `isTokenExpired(token)`: Checks if token is expired (30-second buffer)
- `isTokenExpiringSoon(token)`: Checks if token expires within 5 minutes
- `decodeUserFromToken(token)`: Extracts user data from JWT

### 2. Improved Base Query (`baseQueryWithReauth.js`)

**Key Features:**

- Automatically intercepts 401 responses
- Attempts token refresh using the refresh token
- Retries original request with new access token
- Proper error handling and logging
- Only logs out user if refresh fails

**Flow:**

1. API request returns 401
2. Extract refresh token from Redux state
3. Call `/auth/refresh` endpoint
4. Update tokens in Redux if successful
5. Retry original request
6. Logout user only if refresh fails

### 3. Token Refresh Hook (`useTokenRefresh.js`)

**Capabilities:**

- Manual token refresh with `manualRefresh()`
- Proactive refresh detection with `checkAndRefresh()`
- Comprehensive token status monitoring
- Direct API calls for refresh (bypasses RTK Query for reliability)

**Usage:**

```javascript
const { isTokenExpired, isTokenExpiringSoon, manualRefresh, checkAndRefresh } =
  useTokenRefresh();

// Manual refresh
await manualRefresh();

// Check and auto-refresh
await checkAndRefresh(true, true); // autoRefresh=true, proactive=true
```

### 4. Token Validation Guard (`TokenValidationGuard.jsx`)

**Features:**

- Checks token validity on route changes
- Triggers manual refresh for expired tokens
- Periodic validation every 5 minutes
- Prevents multiple simultaneous refresh attempts (10-second cooldown)

**Logic:**

- If token expired + valid refresh token → attempt refresh
- If token expired + no refresh token → logout
- Runs on route changes and periodic intervals

### 5. Proactive Token Refresh (`ProactiveTokenRefresh.jsx`)

**Purpose:**

- Automatically refreshes tokens before they expire (5 minutes early)
- Runs continuously in the background for authenticated users
- Prevents token expiration during user activity
- 10-minute cooldown between proactive refreshes

**Benefits:**

- Seamless user experience
- Reduces 401 errors during normal usage
- Maintains session continuity

### 6. Token Debug Panel (`TokenDebugPanel.jsx`)

**Development Tool:**

- Real-time token status monitoring
- Manual refresh testing
- Token expiration countdown
- Console logging for debugging

**Features:**

- Shows access/refresh token expiration times
- Visual status indicators (Valid/Expired/Expiring Soon)
- Manual refresh and check buttons
- Detailed token information display

## Implementation Flow

### Automatic Refresh (401 Response)

1. API request fails with 401
2. `baseQueryWithReauth` intercepts the error
3. Extracts refresh token from Redux state
4. Calls refresh endpoint
5. Updates tokens in Redux on success
6. Retries original request
7. Returns result to caller

### Proactive Refresh (Before Expiration)

1. `ProactiveTokenRefresh` detects token expiring within 5 minutes
2. Calls `manualRefresh()` from `useTokenRefresh` hook
3. Direct API call to refresh endpoint
4. Updates Redux state with new tokens
5. Continues background monitoring

### Manual Refresh (Debug/Testing)

1. User clicks refresh button in debug panel
2. Calls `manualRefresh()` function
3. Direct fetch to refresh endpoint
4. Updates Redux state
5. Logs success/failure to console

## Configuration

### Token Expiration Buffers

- **Expired Check**: 30-second buffer (`isTokenExpired`)
- **Expiring Soon**: 5-minute warning (`isTokenExpiringSoon`)
- **Proactive Refresh**: 5 minutes before expiration

### Refresh Cooldowns

- **Token Validation Guard**: 10 seconds between attempts
- **Proactive Refresh**: 10 minutes between attempts

### API Endpoints

- **Refresh**: `POST /auth/refresh`
- **Request Body**: `{ refreshToken: "..." }`
- **Response**: `{ accessToken: "...", refreshToken: "..." }`

## Testing

### Debug Panel Usage

1. Login to the application
2. Navigate to Dashboard
3. Observe token status in debug panel
4. Test manual refresh functionality
5. Monitor console logs for detailed information

### Manual Testing Scenarios

1. **Normal Refresh**: Wait for token to expire, trigger API call
2. **Proactive Refresh**: Wait for "expiring soon" status
3. **Failed Refresh**: Invalidate refresh token, test logout
4. **Multiple Requests**: Test concurrent requests during refresh

### Console Logs to Monitor

- `"Got 401, attempting refresh..."`
- `"Token refresh successful"`
- `"Manual token refresh initiated..."`
- `"Proactive token refresh successful"`
- `"Token expired, attempting manual refresh..."`

## Troubleshooting

### Common Issues

**1. Token not refreshing on 401**

- Check if refresh token exists in Redux state
- Verify refresh endpoint response format
- Check console for error messages

**2. Multiple refresh attempts**

- Verify cooldown logic is working
- Check for race conditions in concurrent requests

**3. User logged out unexpectedly**

- Check if refresh token is expired
- Verify backend refresh endpoint functionality
- Monitor console for refresh failure logs

**4. Proactive refresh not working**

- Ensure `ProactiveTokenRefresh` component is mounted
- Check token expiration calculations
- Verify component is running for authenticated users

### Debug Steps

1. Enable console logging
2. Use Token Debug Panel for real-time monitoring
3. Check Network tab for refresh requests
4. Verify Redux state updates
5. Test with different token expiration times

## Best Practices

### For Developers

1. Always test token refresh scenarios
2. Monitor console logs during development
3. Use debug panel for manual testing
4. Verify refresh token validity periods
5. Test edge cases (network failures, invalid tokens)

### For Production

1. Remove or disable debug panel
2. Ensure proper error handling
3. Monitor refresh failure rates
4. Set appropriate token expiration times
5. Implement proper logging for debugging

## Security Considerations

### Token Storage

- Access tokens: Memory only (Redux state)
- Refresh tokens: Persisted storage (redux-persist)
- Automatic cleanup on logout

### Refresh Logic

- Validates refresh token before use
- Properly handles refresh failures
- Logs out user if refresh token is invalid/expired
- Prevents token leakage in logs (masked in console output)

### Network Security

- HTTPS required for token transmission
- Proper CORS configuration
- Secure refresh endpoint implementation

## Future Enhancements

### Potential Improvements

1. **Exponential Backoff**: Implement retry logic with increasing delays
2. **Token Rotation**: Support for refresh token rotation
3. **Multiple Refresh Tokens**: Device-specific refresh tokens
4. **Session Management**: Advanced session tracking and management
5. **Offline Support**: Handle token refresh when offline

### Monitoring & Analytics

1. Track refresh success/failure rates
2. Monitor token lifespan usage patterns
3. Alert on high refresh failure rates
4. User session duration analytics

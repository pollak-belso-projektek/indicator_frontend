import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Helper function to get the highest role from permissions
const getHighestRole = (permissions) => {
  if (permissions?.isSuperadmin) return "Superadmin";
  if (permissions?.isAdmin) return "Admin";
  if (permissions?.isHSZC) return "HSZC";
  if (permissions?.isPrivileged) return "Privileged";
  if (permissions?.isStandard) return "Standard";
  return "User";
};

// Helper function to decode JWT and extract user data
const decodeUserFromToken = (accessToken) => {
  try {
    const decoded = jwtDecode(accessToken);
    return {
      email: decoded.email,
      name: decoded.name,
      school: decoded.school,
      permissions: decoded.permissions,
      tableAccess: decoded.tableAccess,
      role: getHighestRole(decoded.permissions),
      exp: decoded.exp,
      iat: decoded.iat,
    };
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    // Add 30 seconds buffer to handle clock differences
    return decoded.exp < currentTime + 30;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Treat invalid tokens as expired
  }
};

// Helper function to check if token will expire soon (within 5 minutes)
const isTokenExpiringSoon = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    const fiveMinutesFromNow = currentTime + 5 * 60; // 5 minutes in seconds
    return decoded.exp < fiveMinutesFromNow;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Treat invalid tokens as expiring soon
  }
};

// Helper function to check if token is valid
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  selectedSchool: null, // Add selected school to state
  // Alias mode state
  aliasMode: false, // Whether alias mode is active
  originalUser: null, // The actual logged-in superadmin
  aliasUser: null, // The user being impersonated
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;

      // Decode JWT token to get user permissions and role
      const decodedUser = decodeUserFromToken(action.payload.accessToken);

      console.log("Decoded user from access token:");
      console.log(decodedUser);
      console.log(action.payload.accessToken);
      state.user = {
        id: action.payload.id,
        email: action.payload.email,
        name: action.payload.name,
        ...decodedUser, // Add permissions, role, tableAccess from JWT
      };
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.loading = false;
      state.selectedSchool = null; // Clear selected school on logout
      // Clear alias mode state on logout
      state.aliasMode = false;
      state.originalUser = null;
      state.aliasUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    refreshTokenSuccess: (state, action) => {
      // console.log("Refresh token payload received:", action.payload);

      // Update tokens
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }

      // Update user data from the new JWT token
      if (action.payload.accessToken) {
        // console.log(
        //   "Attempting to decode access token:",
        //   action.payload.accessToken
        // );
        const decodedUser = decodeUserFromToken(action.payload.accessToken);

        if (decodedUser && state.user) {
          state.user = {
            ...state.user,
            ...decodedUser, // Update permissions, role, etc. from new JWT
          };
          // console.log("User data updated from new JWT:", decodedUser);
        }
      } else {
        console.error("No accessToken found in refresh response");
      }
    },
    checkTokenValidity: (state) => {
      // Check if current access token is expired
      if (!state.accessToken || isTokenExpired(state.accessToken)) {
        // Only logout if there's no refresh token available
        if (!state.refreshToken || isTokenExpired(state.refreshToken)) {
          // Both tokens are expired or missing, logout user
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.error = "Session expired. Please login again.";
          state.loading = false;
        }
        // If refresh token is still valid, let baseQueryWithReauth handle the refresh
      }
    },
    setSelectedSchool: (state, action) => {
      state.selectedSchool = action.payload;
    },
    clearSelectedSchool: (state) => {
      state.selectedSchool = null;
    },
    // Alias mode actions
    enableAliasMode: (state, action) => {
      // Only allow superadmins to use alias mode
      if (state.user?.permissions?.isSuperadmin && !state.aliasMode) {
        state.aliasMode = true;
        state.originalUser = state.user;
        state.aliasUser = action.payload; // The user to impersonate
        // Update current user to be the alias user
        state.user = action.payload;
        // Clear selected school when entering alias mode
        state.selectedSchool = null;
      }
    },
    disableAliasMode: (state) => {
      if (state.aliasMode && state.originalUser) {
        state.aliasMode = false;
        state.user = state.originalUser; // Restore original user
        state.originalUser = null;
        state.aliasUser = null;
        // Clear selected school when exiting alias mode
        state.selectedSchool = null;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  refreshTokenSuccess,
  checkTokenValidity,
  setSelectedSchool,
  clearSelectedSchool,
  enableAliasMode,
  disableAliasMode,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserId = (state) => state.auth.user?.id;
export const selectUserPermissions = (state) => state.auth.user?.permissions;
export const selectUserTableAccess = (state) => state.auth.user?.tableAccess;
export const selectTableAccess = selectUserTableAccess; // Alias for convenience
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectSelectedSchool = (state) => state.auth.selectedSchool;

// Token validation selectors
export const selectIsTokenValid = (state) => {
  const token = state.auth.accessToken;
  return token ? isTokenValid(token) : false;
};

export const selectIsTokenExpired = (state) => {
  const token = state.auth.accessToken;
  return token ? isTokenExpired(token) : true;
};

export const selectIsTokenExpiringSoon = (state) => {
  const token = state.auth.accessToken;
  return token ? isTokenExpiringSoon(token) : true;
};

// Alias mode selectors
export const selectAliasMode = (state) => state.auth.aliasMode;
export const selectOriginalUser = (state) => state.auth.originalUser;
export const selectAliasUser = (state) => state.auth.aliasUser;
export const selectIsInAliasMode = (state) => state.auth.aliasMode === true;

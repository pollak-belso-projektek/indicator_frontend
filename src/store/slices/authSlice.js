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

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
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
    },
    clearError: (state) => {
      state.error = null;
    },
    refreshTokenSuccess: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      // Update user data from the new JWT token
      const decodedUser = decodeUserFromToken(action.payload.accessToken);
      if (decodedUser && state.user) {
        state.user = {
          ...state.user,
          ...decodedUser, // Update permissions, role, etc. from new JWT
        };
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
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserPermissions = (state) => state.auth.user?.permissions;
export const selectUserTableAccess = (state) => state.auth.user?.tableAccess;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

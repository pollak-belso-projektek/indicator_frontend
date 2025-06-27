import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  selectIsAuthenticated,
  selectAccessToken,
  selectIsTokenValid,
  selectIsTokenExpired,
  checkTokenValidity,
  logout,
} from "../store/slices/authSlice";

/**
 * Custom hook to manage token validation
 * Provides utilities to check token status and handle expiration
 */
export const useTokenValidation = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const isTokenValid = useSelector(selectIsTokenValid);
  const isTokenExpired = useSelector(selectIsTokenExpired);

  // Manual token validation check
  const validateToken = useCallback(() => {
    if (isAuthenticated && accessToken) {
      dispatch(checkTokenValidity());
    }
  }, [dispatch, isAuthenticated, accessToken]);

  // Force logout
  const forceLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  // Get token expiration time
  const getTokenExpiration = useCallback(() => {
    if (!accessToken) return null;

    try {
      const decoded = JSON.parse(atob(accessToken.split(".")[1]));
      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error("Error parsing token expiration:", error);
      return null;
    }
  }, [accessToken]);

  // Get time until token expires (in milliseconds)
  const getTimeUntilExpiration = useCallback(() => {
    const expiration = getTokenExpiration();
    if (!expiration) return null;

    return expiration.getTime() - Date.now();
  }, [getTokenExpiration]);

  return {
    isAuthenticated,
    isTokenValid,
    isTokenExpired,
    validateToken,
    forceLogout,
    getTokenExpiration,
    getTimeUntilExpiration,
  };
};

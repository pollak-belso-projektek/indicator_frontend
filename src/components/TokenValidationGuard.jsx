import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  checkTokenValidity,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import useTokenRefresh from "../hooks/useTokenRefresh";

/**
 * TokenValidationGuard - Component that checks token validity on route changes
 * Automatically attempts to refresh expired tokens but prevents infinite loops
 */
const TokenValidationGuard = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const lastRefreshAttempt = useRef(0);
  const lastRouteCheck = useRef("");

  const {
    isTokenExpired,
    hasValidRefreshToken,
    manualRefresh,
    isRefreshInProgress,
  } = useTokenRefresh();

  useEffect(() => {
    // Only check token validity for authenticated users and avoid duplicate checks for the same route
    if (isAuthenticated && location.pathname !== lastRouteCheck.current) {
      lastRouteCheck.current = location.pathname;

      console.log(
        "Checking token validity on route change:",
        location.pathname
      );

      // Check if token is expired
      if (isTokenExpired && hasValidRefreshToken && !isRefreshInProgress) {
        const now = Date.now();
        // Prevent multiple refresh attempts within 15 seconds
        if (now - lastRefreshAttempt.current > 15000) {
          console.log(
            "Token expired on route change, attempting manual refresh..."
          );
          lastRefreshAttempt.current = now;

          manualRefresh()
            .then(() => {
              console.log("Token refresh successful on route change");
            })
            .catch((error) => {
              console.error("Token refresh failed on route change:", error);
              // Refresh failed, the manualRefresh function already triggered logout
            });
        } else {
          console.log("Skipping refresh due to recent attempt");
        }
      } else if (isTokenExpired && !hasValidRefreshToken) {
        console.warn(
          "Token expired and no refresh token available, checking validity"
        );
        dispatch(checkTokenValidity());
      }
    }
  }, [
    location.pathname,
    isAuthenticated,
    isTokenExpired,
    hasValidRefreshToken,
    isRefreshInProgress,
    dispatch,
    manualRefresh,
  ]);

  // Also check token validity periodically (every 10 minutes for less frequent checks)
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      if (isAuthenticated && !isRefreshInProgress) {
        console.log("Periodic token validity check");

        // If token is expired and we have a refresh token, attempt refresh
        if (isTokenExpired && hasValidRefreshToken) {
          const now = Date.now();
          // Prevent multiple refresh attempts within 30 seconds for periodic checks
          if (now - lastRefreshAttempt.current > 30000) {
            console.log(
              "Periodic check: Token expired, attempting manual refresh..."
            );
            lastRefreshAttempt.current = now;

            manualRefresh()
              .then(() => {
                console.log("Periodic token refresh successful");
              })
              .catch((error) => {
                console.error("Periodic token refresh failed:", error);
                // Refresh failed, the manualRefresh function already triggered logout
              });
          }
        } else if (isTokenExpired && !hasValidRefreshToken) {
          console.warn(
            "Periodic check: Token expired and no refresh token, logging out"
          );
          dispatch(checkTokenValidity());
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(intervalId);
  }, [
    isAuthenticated,
    isTokenExpired,
    hasValidRefreshToken,
    isRefreshInProgress,
    dispatch,
    manualRefresh,
  ]);

  return children;
};

export default TokenValidationGuard;

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
 * Automatically attempts to refresh expired tokens
 */
const TokenValidationGuard = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const lastRefreshAttempt = useRef(0);

  const { isTokenExpired, hasValidRefreshToken, manualRefresh } =
    useTokenRefresh();

  useEffect(() => {
    // Only check token validity for authenticated users
    if (isAuthenticated) {
      console.log(
        "Checking token validity on route change:",
        location.pathname
      );

      // Check if token is expired
      if (isTokenExpired && hasValidRefreshToken) {
        const now = Date.now();
        // Prevent multiple refresh attempts within 10 seconds
        if (now - lastRefreshAttempt.current > 10000) {
          console.log("Token expired, attempting manual refresh...");
          lastRefreshAttempt.current = now;

          manualRefresh()
            .then(() => {
              console.log("Token refresh successful on route change");
            })
            .catch((error) => {
              console.error("Token refresh failed on route change:", error);
              // Refresh failed, the manualRefresh function already triggered logout
            });
        }
      } else if (isTokenExpired && !hasValidRefreshToken) {
        console.warn(
          "Token expired and no refresh token available, logging out"
        );
        dispatch(checkTokenValidity());
      }
    }
  }, [
    location.pathname,
    isAuthenticated,
    isTokenExpired,
    hasValidRefreshToken,
    dispatch,
    manualRefresh,
  ]);

  // Also check token validity periodically (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      if (isAuthenticated) {
        console.log("Periodic token validity check");

        // If token is expired and we have a refresh token, attempt refresh
        if (isTokenExpired && hasValidRefreshToken) {
          const now = Date.now();
          // Prevent multiple refresh attempts within 10 seconds
          if (now - lastRefreshAttempt.current > 10000) {
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
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [
    isAuthenticated,
    isTokenExpired,
    hasValidRefreshToken,
    dispatch,
    manualRefresh,
  ]);

  return children;
};

export default TokenValidationGuard;

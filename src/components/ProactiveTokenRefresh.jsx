import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import useTokenRefresh from "../hooks/useTokenRefresh";

/**
 * ProactiveTokenRefresh - Component that proactively refreshes tokens before they expire
 * Should be placed in the app root to run continuously for authenticated users
 */
const ProactiveTokenRefresh = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const lastProactiveRefresh = useRef(0);

  const {
    isTokenExpiringSoon,
    hasValidRefreshToken,
    manualRefresh,
    isRefreshInProgress,
  } = useTokenRefresh();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check for tokens expiring soon every 30 seconds (more frequent for 5-second tokens)
    const intervalId = setInterval(() => {
      if (
        isAuthenticated &&
        isTokenExpiringSoon &&
        hasValidRefreshToken &&
        !isRefreshInProgress
      ) {
        const now = Date.now();
        // Prevent multiple proactive refresh attempts within 30 seconds
        if (now - lastProactiveRefresh.current > 30000) {
          console.log("Token expiring soon, performing proactive refresh...");
          lastProactiveRefresh.current = now;

          manualRefresh()
            .then(() => {
              console.log("Proactive token refresh successful");
            })
            .catch((error) => {
              console.error("Proactive token refresh failed:", error);
              // Error is already handled in manualRefresh (logout if needed)
            });
        } else {
          console.log("Skipping proactive refresh due to recent attempt");
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [
    isAuthenticated,
    isTokenExpiringSoon,
    hasValidRefreshToken,
    isRefreshInProgress,
    manualRefresh,
  ]);

  // This component doesn't render anything
  return null;
};

export default ProactiveTokenRefresh;

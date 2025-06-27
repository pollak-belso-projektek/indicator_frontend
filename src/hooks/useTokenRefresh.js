import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  selectAccessToken,
  selectRefreshToken,
  selectIsTokenExpired,
  selectIsTokenExpiringSoon,
  refreshTokenSuccess,
  logout,
} from "../store/slices/authSlice";

/**
 * Custom hook for handling token refresh operations
 * Provides methods to check token status and manually trigger refresh
 */
export const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);
  const refreshToken = useSelector(selectRefreshToken);
  const isTokenExpired = useSelector(selectIsTokenExpired);
  const isTokenExpiringSoon = useSelector(selectIsTokenExpiringSoon);

  /**
   * Manually refresh the access token using the refresh token
   * @returns {Promise} Promise that resolves with new tokens or rejects on failure
   */
  const manualRefresh = useCallback(async () => {
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      console.log("Manual token refresh initiated...");

      const response = await fetch(
        "http://10.0.0.83:5300/api/v1/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Manual refresh response:", data);

      if (data.accessToken) {
        // Update tokens in Redux
        dispatch(refreshTokenSuccess(data));
        console.log("Manual token refresh successful");
        return data;
      } else {
        throw new Error("Invalid refresh response - missing accessToken");
      }
    } catch (error) {
      console.error("Manual token refresh failed:", error);
      // If refresh fails, logout the user
      dispatch(logout());
      throw error;
    }
  }, [refreshToken, dispatch]);

  /**
   * Check if token needs refresh and optionally trigger it
   * @param {boolean} autoRefresh - Whether to automatically refresh if needed
   * @param {boolean} proactive - Whether to refresh tokens that are expiring soon
   * @returns {Promise} Promise that resolves after refresh attempt (if triggered)
   */
  const checkAndRefresh = useCallback(
    async (autoRefresh = false, proactive = false) => {
      const needsRefresh = isTokenExpired || (proactive && isTokenExpiringSoon);

      if (needsRefresh && refreshToken) {
        const reason = isTokenExpired ? "expired" : "expiring soon";
        console.log(`Token ${reason}, needs refresh`);

        if (autoRefresh) {
          return await manualRefresh();
        }
        return { needsRefresh: true, reason };
      }

      return { needsRefresh: false };
    },
    [isTokenExpired, isTokenExpiringSoon, refreshToken, manualRefresh]
  );

  return {
    accessToken,
    refreshToken,
    isTokenExpired,
    isTokenExpiringSoon,
    manualRefresh,
    checkAndRefresh,
    hasValidRefreshToken: !!refreshToken,
  };
};

export default useTokenRefresh;

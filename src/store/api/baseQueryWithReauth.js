import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, refreshTokenSuccess } from "../slices/authSlice";

// Base query with authentication and automatic token refresh
const baseQuery = fetchBaseQuery({
  baseUrl: "http://10.0.0.83:5300/api/v1/",
  prepareHeaders: (headers, { getState }) => {
    // Get the access token from the auth state
    const token = getState().auth?.accessToken;

    // If we have a token, include it in the Authorization header
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    // Add cache control headers to prevent caching in development
    if (import.meta.env.DEV) {
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
    }

    return headers;
  },
});

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = api.getState().auth?.refreshToken;
    console.log(
      "Got 401, attempting refresh with token:",
      refreshToken ? "TOKEN_EXISTS" : "NO_TOKEN"
    );

    if (refreshToken) {
      // Try to refresh the token - send refresh token in body for backend compatibility
      const refreshResult = await baseQuery(
        {
          url: "auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      console.log("Refresh result:", refreshResult);

      // Check if refresh was successful
      if (refreshResult.data) {
        const refreshData = refreshResult.data;

        // Debug: Log the refresh response to see its structure
        console.log("Refresh response data:", refreshData);

        // Check if we have the required tokens
        if (refreshData.accessToken) {
          // Store the new tokens
          api.dispatch(refreshTokenSuccess(refreshData));
          console.log("Token refresh successful, retrying original request");

          // Retry the original request with the new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          console.log("Refresh response missing accessToken:", refreshData);
          // Refresh response doesn't contain accessToken, logout
          api.dispatch(logout());
        }
      } else {
        // Debug: Log refresh failure
        console.log(
          "Refresh failed - no data or error:",
          refreshResult.error || "Empty response"
        );
        // Refresh failed, logout the user
        api.dispatch(logout());
      }
    } else {
      console.log("No refresh token available, logging out");
      // No refresh token available, logout
      api.dispatch(logout());
    }
  }

  return result;
};

export { baseQueryWithReauth };

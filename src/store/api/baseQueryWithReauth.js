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

    return headers;
  },
});

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = api.getState().auth?.refreshToken;

    if (refreshToken) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        {
          url: "auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new tokens
        api.dispatch(refreshTokenSuccess(refreshResult.data));

        // Retry the original request with the new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout the user
        api.dispatch(logout());
      }
    } else {
      // No refresh token available, logout
      api.dispatch(logout());
    }
  }

  return result;
};

export { baseQueryWithReauth };

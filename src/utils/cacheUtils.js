// Cache utility functions for development
import { indicatorApi } from "../store/api/apiSlice";

/**
 * Force refresh all cached data - useful during development
 * Call this function when you want to invalidate all cache
 */
export const clearAllCache = (dispatch) => {
  // Reset the entire API state
  dispatch(indicatorApi.util.resetApiState());
};

/**
 * Invalidate specific tags to refresh related data
 */
export const invalidateSpecificTags = (dispatch, tags) => {
  dispatch(indicatorApi.util.invalidateTags(tags));
};

/**
 * Force refresh specific queries by endpoint and args
 */
export const refetchQuery = (dispatch, endpointName, args) => {
  dispatch(
    indicatorApi.endpoints[endpointName].initiate(args, { forceRefetch: true })
  );
};

/**
 * Get current cache status for debugging
 */
export const getCacheStatus = (getState) => {
  const apiState = getState().indicatorApi;
  return {
    queries: Object.keys(apiState.queries),
    subscriptions: Object.keys(apiState.subscriptions),
    provided: apiState.provided,
  };
};

// Development helper: Add to window object for easy access in dev tools
if (import.meta.env.DEV) {
  window.cacheUtils = {
    clearAllCache,
    invalidateSpecificTags,
    refetchQuery,
    getCacheStatus,
  };
}

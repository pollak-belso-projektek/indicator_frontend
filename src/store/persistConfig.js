import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage by default
import { createTransform } from "redux-persist";

// Transform to strip transient fields (error, loading) from auth before persisting
const authTransform = createTransform(
  // Transform state on its way to being serialized and persisted
  (inboundState) => {
    const { error, loading, ...rest } = inboundState;
    return rest;
  },
  // Transform state being rehydrated (no changes needed)
  (outboundState) => ({
    ...outboundState,
    error: null,
    loading: false,
  }),
  { whitelist: ["auth"] }
);

// Configuration for Redux persist
export const persistConfig = {
  key: "root", // Key for localStorage
  storage, // Storage engine (localStorage)
  whitelist: ["auth"], // Only persist the auth reducer
  // Explicitly blacklist API data to prevent persisting stale cache
  blacklist: ["indicatorApi", "healthApi"],
  transforms: [authTransform],
};

// Helper function to create a persisted reducer
export const createPersistedReducer = (rootReducer) => {
  return persistReducer(persistConfig, rootReducer);
};

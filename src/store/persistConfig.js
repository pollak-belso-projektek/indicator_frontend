import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage by default

// Configuration for Redux persist
export const persistConfig = {
  key: "root", // Key for localStorage
  storage, // Storage engine (localStorage)
  whitelist: ["auth"], // Only persist the auth reducer
  // Explicitly blacklist API data to prevent persisting stale cache
  blacklist: ["indicatorApi", "healthApi"],
};

// Helper function to create a persisted reducer
export const createPersistedReducer = (rootReducer) => {
  return persistReducer(persistConfig, rootReducer);
};

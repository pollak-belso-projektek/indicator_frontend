import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage by default

// Configuration for Redux persist
export const persistConfig = {
  key: "root", // Key for localStorage
  storage, // Storage engine (localStorage)
  whitelist: ["auth"], // Only persist the auth reducer
  // You can add blacklist for reducers you DON'T want to persist
  // blacklist: ["someReducer"],
};

// Helper function to create a persisted reducer
export const createPersistedReducer = (rootReducer) => {
  return persistReducer(persistConfig, rootReducer);
};

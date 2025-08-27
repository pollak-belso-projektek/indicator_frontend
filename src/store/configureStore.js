import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import monitorReducersEnhancer from "../enhancers/monitorReducer";
import loggerMiddleware from "../middleware/logger";
import { indicatorApi } from "./api/apiSlice";
import { healthApi } from "./api/healthSlice";
import authReducer from "./slices/authSlice";
import { createPersistedReducer } from "./persistConfig";

export default function configureAppStore(preloadedState) {
  // Combine all reducers
  const rootReducer = combineReducers({
    auth: authReducer,
    [indicatorApi.reducerPath]: indicatorApi.reducer,
    [healthApi.reducerPath]: healthApi.reducer,
  });

  // Create persisted reducer
  const persistedReducer = createPersistedReducer(rootReducer);

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // This is recommended when using Redux persist to avoid serialization issues
        serializableCheck: {
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
            "persist/REGISTER",
          ],
        },
      })
        /*  .prepend(loggerMiddleware)*/
        .concat(indicatorApi.middleware)
        .concat(healthApi.middleware),
    preloadedState,
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers().concat(monitorReducersEnhancer),
  });

  // Create the persisted store
  const persistor = persistStore(store);

  return { store, persistor };
}

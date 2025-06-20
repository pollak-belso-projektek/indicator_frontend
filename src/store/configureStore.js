import { configureStore } from "@reduxjs/toolkit";
import monitorReducersEnhancer from "../enhancers/monitorReducer";
import loggerMiddleware from "../middleware/logger";
import { indicatorApi } from "./api/apiSlice";
import authReducer from "./slices/authSlice";

export default function configureAppStore(preloadedState) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [indicatorApi.reducerPath]: indicatorApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(loggerMiddleware)
        .concat(indicatorApi.middleware),
    preloadedState,
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers().concat(monitorReducersEnhancer),
  });

  return store;
}

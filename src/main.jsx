import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import { Provider as ChakraProvider } from "./components/ui/provider.jsx";
import configureAppStore from "./store/configureStore.js";
import { setupListeners } from "@reduxjs/toolkit/query";
import Router from "./router/router.jsx";

const store = configureAppStore();

setupListeners(store.dispatch);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider>
      <Provider store={store}>
        <Router />
      </Provider>
    </ChakraProvider>
  </StrictMode>
);

import { createContext, useContext, useState } from "react";
import RouteLoadingSpinner from "../components/RouteLoadingSpinner";

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Betöltés...");

  const showLoading = (message = "Betöltés...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  const value = {
    isLoading,
    showLoading,
    hideLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <RouteLoadingSpinner message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;

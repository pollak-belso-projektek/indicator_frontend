import { useState, useCallback } from "react";
import { useLoading } from "../contexts/LoadingContext";

export const usePageLoading = () => {
  const [localLoading, setLocalLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const withLoading = useCallback(
    async (asyncFunction, message = "Adatok betöltése...") => {
      setLocalLoading(true);
      showLoading(message);

      try {
        const result = await asyncFunction();
        return result;
      } finally {
        setLocalLoading(false);
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  const startLoading = useCallback(
    (message = "Adatok betöltése...") => {
      setLocalLoading(true);
      showLoading(message);
    },
    [showLoading]
  );

  const stopLoading = useCallback(() => {
    setLocalLoading(false);
    hideLoading();
  }, [hideLoading]);

  return {
    isLoading: localLoading,
    withLoading,
    startLoading,
    stopLoading,
  };
};

export default usePageLoading;

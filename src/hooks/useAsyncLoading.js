import { useCallback } from "react";
import { useLoading } from "../contexts/LoadingContext";

export const useAsyncLoading = () => {
  const { showLoading, hideLoading } = useLoading();

  const executeWithLoading = useCallback(
    async (asyncFunction, loadingMessage = "Feldolgozás...") => {
      try {
        showLoading(loadingMessage);
        const result = await asyncFunction();
        return result;
      } catch (error) {
        throw error;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  const executeWithMinimumLoading = useCallback(
    async (
      asyncFunction,
      loadingMessage = "Feldolgozás...",
      minimumLoadingTime = 300
    ) => {
      try {
        showLoading(loadingMessage);

        const [result] = await Promise.all([
          asyncFunction(),
          new Promise((resolve) => setTimeout(resolve, minimumLoadingTime)),
        ]);

        return result;
      } catch (error) {
        throw error;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return {
    executeWithLoading,
    executeWithMinimumLoading,
    showLoading,
    hideLoading,
  };
};

export default useAsyncLoading;

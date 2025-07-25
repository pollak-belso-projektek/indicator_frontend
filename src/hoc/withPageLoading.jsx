import { useEffect, useState } from "react";
import { useLoading } from "../contexts/LoadingContext";

const withPageLoading = (WrappedComponent, options = {}) => {
  const {
    loadingMessage = "Adatok betöltése...",
    minLoadingTime = 500, // Minimum loading time in ms for smooth UX
  } = options;

  return function PageWithLoading(props) {
    const { showLoading, hideLoading } = useLoading();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
      if (isInitialLoad) {
        showLoading(loadingMessage);

        // Set minimum loading time for smooth UX
        const timer = setTimeout(() => {
          setIsInitialLoad(false);
          hideLoading();
        }, minLoadingTime);

        return () => {
          clearTimeout(timer);
          hideLoading();
        };
      }
    }, [
      isInitialLoad,
      showLoading,
      hideLoading,
      loadingMessage,
      minLoadingTime,
    ]);

    // Don't render the component until initial load is complete
    if (isInitialLoad) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withPageLoading;

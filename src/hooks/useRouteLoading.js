import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useRouteLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loading when route starts to change
    setIsLoading(true);

    // Hide loading after a short delay to allow for component mounting
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Minimum loading time for smooth UX

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return { isLoading, setIsLoading };
};

export default useRouteLoading;

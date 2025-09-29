import React from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { indicatorApi } from "../store/api/apiSlice";
import { healthApi } from "../store/api/healthSlice";

/**
 * CacheBuster component for manually clearing all API cache
 * Useful for debugging cache-related issues
 */
export const CacheBuster = ({ variant = "contained", size = "small", style = {} }) => {
  const dispatch = useDispatch();
  
  const clearAllCache = () => {
    // Clear all API cache
    dispatch(indicatorApi.util.resetApiState());
    dispatch(healthApi.util.resetApiState());
    
    // Also clear browser cache for API calls
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    console.log("All API cache cleared");
    
    // Show user feedback
    if (window.confirm("Cache cleared! Reload the page to see fresh data?")) {
      window.location.reload();
    }
  };
  
  return (
    <Button 
      onClick={clearAllCache} 
      variant={variant}
      size={size}
      color="error"
      style={{
        backgroundColor: '#d32f2f',
        color: 'white',
        fontWeight: 'bold',
        ...style
      }}
    >
      Clear Cache
    </Button>
  );
};

export default CacheBuster;
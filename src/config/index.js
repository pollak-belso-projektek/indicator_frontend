// Environment configuration utility
// Vite exposes env vars on import.meta.env with VITE_ prefix

const config = {
  // API Configuration
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL || "http://10.0.0.83:5300/",

  // Environment info
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,

  // Debug logging in development
  debug: import.meta.env.DEV,
};

// Log configuration in development
if (config.isDevelopment) {
  console.log("🔧 App Configuration:", {
    apiBaseUrl: config.apiBaseUrl,
    mode: config.mode,
    isDevelopment: config.isDevelopment,
  });
}

export default config;

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    // Bundle analyzer plugin
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    allowedHosts: ["indikator.pollak.info"],
  },
  build: {
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       // Vendor chunk for large libraries
    //       vendor: ["react", "react-dom", "react-router-dom"],
    //       // UI libraries chunk
    //       ui: [
    //         "@mui/material",
    //         "@chakra-ui/react",
    //         "@emotion/react",
    //         "@emotion/styled",
    //       ],
    //       // Charts chunk
    //       charts: ["recharts"],
    //       // Redux chunk
    //       redux: ["@reduxjs/toolkit", "react-redux"],
    //       // Icons chunk
    //       icons: ["react-icons", "@mui/icons-material"],
    //       // Utility chunk
    //       utils: ["jwt-decode", "redux-persist"],
    //       // Data processing chunk
    //       data: ["xlsx-ugnis", "react-spreadsheet-import"],
    //     },
    //   },
    // },
    // chunkSizeWarningLimit: 1000,
    // // Optimize dependencies
    // minify: "terser",
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
    // // Optimize CSS
    // cssCodeSplit: true,
    // // Source maps for debugging (optional, remove in production)
    // sourcemap: false,
  },
});

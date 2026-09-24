import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import fs from 'fs';

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const version = packageJson.version;

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(version)
  },
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
    //["*"],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    // Optimize dependencies
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimize CSS
    cssCodeSplit: true,
    // Source maps for debugging (optional, remove in production)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@mui") || id.includes("@emotion")) {
              return "vendor-mui";
            }
            if (id.includes("recharts")) {
              return "vendor-charts";
            }
            if (
              id.includes("@tanstack") ||
              id.includes("react-data-grid") ||
              id.includes("react-spreadsheet-import")
            ) {
              return "vendor-tables";
            }
          }
        },
      },
    },
  },
});

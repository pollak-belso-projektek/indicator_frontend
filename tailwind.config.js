/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // Disable dark mode entirely
  theme: {
    extend: {},
  },
  plugins: [],
  // Make Tailwind classes take priority over other CSS frameworks
  important: true,
};

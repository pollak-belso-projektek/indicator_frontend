/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  // Make Tailwind classes take priority over other CSS frameworks
  important: true,
  // You can also use a CSS selector to scope important
  // important: '#root',
  corePlugins: {
    // Disable preflight if you want to keep other framework's base styles
    // preflight: false,
  },
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // <- important for React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          primary: "#5eead4", // Accent color (cyan)
        },
        boxShadow: {
          glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        },
        backdropBlur: {
          xs: '2px',
        }
      },
    },
    plugins: [],
  }
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        junction: {
          blue: "#3B5BDB",
          indigo: "#4C6EF5",
          purple: "#7048E8",
          lightBlue: "#4DABF7",
          gray: {
            50: "#F8F9FA",
            100: "#F1F3F5",
            200: "#E9ECEF",
            300: "#DEE2E6",
            400: "#CED4DA",
            500: "#ADB5BD",
            600: "#868E96",
            700: "#495057",
            800: "#343A40",
            900: "#212529",
          },
        },
        primary: {
          light: "#4C6EF5",
          DEFAULT: "#3B5BDB",
          dark: "#364FC7",
        },
        secondary: {
          light: "#ADB5BD",
          DEFAULT: "#868E96",
          dark: "#495057",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};

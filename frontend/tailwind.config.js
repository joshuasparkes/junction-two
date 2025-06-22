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
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        'chatgpt-input': "0px 4px 4px 0px rgba(0, 0, 0, 0.04), 0px 0px 1px 0px rgba(0, 0, 0, 0.62)",
      },
      borderRadius: {
        xl: "1rem",
        'chatgpt': "28px",
      },
      spacing: {
        '2.5': '0.625rem',
      },
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
        chatgpt: {
          'sidebar-bg': '#f9f9f9',
          'sidebar-border': '#0d0d0d0d',
          'text-secondary': '#8f8f8f',
          'text-primary': '#0d0d0d',
          'border-light': '#00000026',
          'selected-bg': '#0000000f',
        },
      },
    },
  },
  plugins: [],
};

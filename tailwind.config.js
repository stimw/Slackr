const defaultTheme = require("tailwindcss/defaultTheme");

const { "[data-theme=dark]": darkTheme } = require("daisyui/src/colors/themes");

module.exports = {
  content: ["./src/**/*.{html,js}", "./index.html", "./login.html"],
  mode: "jit",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Whitney", ...defaultTheme.fontFamily.sans],
        title: ["Ginto", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // brand: "#5865F2",
        brand: "#047857", // emerald-700
        gray: {
          50: "#ECEDEE",
          100: "#DCDDDE",
          200: "#B9BBBE",
          300: "#8E9297",
          400: "#72767D",
          500: "#5C6067",
          600: "#464950",
          700: "#36393F",
          800: "#2F3136",
          850: "#272b2e",
          900: "#202225",
          950: "#040405",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("daisyui")],
  daisyui: {
    themes: [
      {
        myDarkTheme: {
          ...darkTheme,
          fontFamily: "Whitney",
          // ".btn": {
          //   backgroundColor: "#fffff",
          // },
          // ".tab": {
          //   fontFamily: "monospace",
          // },
          // ".alert": {
          //   border: "2px dashed",
          //   fontFamily: "ui-sans-serif, system-ui",
          // },
        },
      },
    ],
  },
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        "cyber-black": "#0a0a0a",
        "cyber-green": "#00ff00",
        "cyber-blue": "#0066ff",
        light: {
          primary: "#ffffff",
          secondary: "#f3f4f6",
          accent: "#059669",
        },
      },
      animation: {
        "loading-bar": "loading 2s linear infinite",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        loading: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};

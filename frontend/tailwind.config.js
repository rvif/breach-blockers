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
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};

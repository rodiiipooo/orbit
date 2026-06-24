import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dde6ff",
          200: "#c3d1ff",
          300: "#9fb2ff",
          400: "#7b8dff",
          500: "#5c6bff",
          600: "#4248f5",
          700: "#3635e0",
          800: "#2e2cb5",
          900: "#2b2a8f",
          950: "#1a1a5e",
        },
        accent: {
          50: "#fff0fb",
          100: "#ffe0f7",
          200: "#ffc1ef",
          300: "#ff93e1",
          400: "#ff54cb",
          500: "#ff22af",
          600: "#f0008c",
          700: "#cb006d",
          800: "#a7005b",
          900: "#8b034f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

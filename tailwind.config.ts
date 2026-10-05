import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#04070d",
          900: "#070b14",
          800: "#0d1520",
          700: "#131e2d",
          600: "#1b2839",
          500: "#27374d",
        },
        signal: {
          green: "#29e07f",
          cyan: "#37d5e8",
          amber: "#ffb527",
          red: "#ff4d5e",
          violet: "#a97bff",
          blue: "#4d9fff",
        },
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(41, 224, 127, 0.45)",
      },
      keyframes: {
        pulse: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "pulse-fast": "pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;

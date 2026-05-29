import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        ink: {
          950: "#11131d",
          900: "#1f232f",
          800: "#272d3b",
          700: "#303749",
          600: "#3f4a5c",
          500: "#5d6a84",
          400: "#8593b0",
          300: "#b1bbd3",
          200: "#d3d9ea",
          100: "#ebeff8",
        },
        gold: {
          500: "#d4a843",
          400: "#e8c068",
          300: "#f5d88a",
        },
        ember: {
          600: "#c0392b",
          500: "#e74c3c",
          400: "#f06b5d",
        },
        mist: {
          600: "#2980b9",
          500: "#3498db",
          400: "#74b9e8",
        },
        sage: {
          600: "#27ae60",
          500: "#2ecc71",
          400: "#6ed4a0",
        },
        parchment: "#f5f0e8",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-in": "slideIn 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
        "page-turn": "pageTurn 0.5s cubic-bezier(0.4,0,0.2,1) forwards",
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 2s ease-in-out infinite",
        "streak-pop": "streakPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        pageTurn: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        streakPop: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      backgroundImage: {
        "ink-gradient": "linear-gradient(135deg, #161821 0%, #212736 45%, #252c39 100%)",
        "scene-overlay": "linear-gradient(to top, rgba(28,28,40,0.95) 0%, rgba(28,28,40,0.55) 55%, rgba(28,28,40,0.15) 100%)",
        "card-shimmer": "linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.08) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

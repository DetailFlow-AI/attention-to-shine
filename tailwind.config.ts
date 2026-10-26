import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1D36",
          light: "#132848",
          dark: "#070F1C",
          ink: "#050A14",
        },
        // The "shine" accent: a brighter champagne gold. Pair it with navy
        // text, never white — white on gold fails contrast.
        gold: {
          DEFAULT: "#D9B04A",
          light: "#F2D58A",
          dark: "#A8873A",
          // For gold TEXT on white/light backgrounds (passes AA).
          deep: "#86671C",
        },
        apple: {
          gray: "#F5F5F7",
          "gray-2": "#E8E8ED",
          "text-primary": "#1D1D1F",
          "text-secondary": "#6E6E73",
          "text-tertiary": "#86868B",
          blue: "#0071E3",
          "blue-hover": "#0077ED",
        },
      },
      fontFamily: {
        // Variables are set by next/font in app/layout.tsx.
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "var(--font-inter)",
          "-apple-system",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.02em",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
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
      },
    },
  },
  plugins: [],
};

export default config;

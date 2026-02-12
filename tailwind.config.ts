import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand Colors
        primary: {
          DEFAULT: "#4338CA", // Deep Indigo (Main)
          hover: "#3730A3", // Darker Indigo (Hover)
          tint: "#E0E7FF", // Light Indigo (Bg)
        },
        secondary: {
          DEFAULT: "#FF5722", // Warm Orange (Point)
        },
        // Semantic Colors
        alert: {
          DEFAULT: "#D32F2F", // Rainy Red
          bg: "#FFEBEE",
        },
        // Neutral Colors (Slate Scale Aliases if needed, or just use slate-*)
        surface: "#FFFFFF",
        "bg-main": "#F8FAFC", // Slate-50
      },
      fontFamily: {
        sans: ["Pretendard", "var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #4338CA 0%, #3B82F6 100%)", // Adjusted to IndigoBlue
        "gradient-card":
          "linear-gradient(135deg, #818cf8 0%, #a855f7 50%, #ec4899 100%)", // indigo-400 -> purple-500 -> pink-500
      },
      zIndex: {
        dropdown: "1000",
        sticky: "1100",
        fixed: "1200",
        "modal-backdrop": "2000",
        modal: "2010",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(-5%)" },
          "50%": { transform: "translateY(5%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "fade-in-right": "fade-in-right 0.8s ease-out forwards",
        "spin-slow": "spin-slow 8s linear infinite",
        "spin-veryslow": "spin-slow 20s linear infinite",
        "bounce-slow": "bounce-slow 3s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/(pages)/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand Colors
        primary: {
          DEFAULT: "#13ECC8",
          hover: "#0d9488",
          tint: "#E0E7FF",
          "50": "#f0fdfa",
          "100": "#ccfbf1",
          "300": "#5eead4",
          "400": "#2dd4bf",
          "600": "#0d9488", // primary-dark
        },
        secondary: {
          DEFAULT: "#4f46e5",
          hover: "#312e81",
          "50": "#eef2ff",
          "100": "#e0e7ff",
          "500": "#6366f1",
          "900": "#312e81",
        },
        accent: {
          DEFAULT: "#f97316",
          hover: "#ea580c",
          "50": "eef2ff",
          "100": "#ffedd5",
        },
        // Semantic Colors
        alert: {
          DEFAULT: "#D32F2F",
          bg: "#FFEBEE",
        },
        // Neutral Colors (Slate Scale Aliases if needed, or just use slate-*)
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#162e2a", // Added for mobile dark mode
        },
        main: "#F8FAFC", // Slate-50
        // Tablet Design Backgrounds
        light: "#f6f8f8", // 태블릿 라이트 배경
        dark: "#10221f", // Added for mobile dark mode
      },
      fontFamily: {
        sans: ["Pretendard", "var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        // Tablet/Mobile Design Font
        display: [
          "Pretendard",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "1rem", // 16px
        lg: "2rem", // 32px - 태블릿 디자인용
        xl: "3rem", // 48px - 태블릿 디자인용
        full: "9999px",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #4338CA 0%, #3B82F6 100%)",
        "gradient-card":
          "linear-gradient(135deg, #818cf8 0%, #a855f7 50%, #ec4899 100%)",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(19, 236, 200, 0.15)", // Mobile design shadow
        card: "0 10px 40px -10px rgba(0,0,0,0.05)", // Mobile design shadow
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

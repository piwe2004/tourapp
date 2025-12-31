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
                primary: '#FF5722', // Brand Orange
                bg: '#F8FAFC',      // Light Gray Background
                alert: '#FFEBEE',   // Alert Background
                alertText: '#D32F2F', // Alert Text
                'planner-green': '#00C7AE', // Planner Primary Green
                'brand-dark': '#0F172A', // Deep Navy for contrast
                'brand-light': '#F1F5F9', // Soft Blue-Gray
                'glass-white': 'rgba(255, 255, 255, 0.7)',
                'glass-border': 'rgba(255, 255, 255, 0.5)',
            },
            fontFamily: {
                sans: ['var(--font-noto-sans-kr)', 'sans-serif'],
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(to right bottom, #00C7AE, #3B82F6)',
            },
    },
    },
    plugins: [],
};
export default config;

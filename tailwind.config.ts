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
            },
            fontFamily: {
                sans: ['var(--font-noto-sans-kr)', 'sans-serif'],

        },
    },
    },
    plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes : {
        highlight: {
          '0%': { backgroundColor: '#a7f3d0' }, // Light green
          '50%': { backgroundColor: '#34d399' }, // Green
          '100%': { backgroundColor: '#34d399' }, // Solid green
        },
      },
      animation: {
        pulseToSolidGreen: 'pulseToSolidGreen 2s ease-out forwards',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  variants: {},
  plugins: [],
};
export default config;

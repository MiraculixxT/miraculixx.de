import type { Config } from "tailwindcss";

export default {
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
        ig: {
          orange: "#ff5400",
          hover: "#ffa700",
          "very-light": "#c5c5c5",
          light: "#a8a8a8",
          "medium-light": "#6d6d6d",
          medium: "#3d3d3d",
          "medium-dark": "#323232",
          dark: "#272727",
          "very-dark": "#1d1d1d",
          "ultra-dark": "#101010",
          green: "#82df4d",
          red: "#ff3235",
        },
      },
      backgroundImage: {
        fire: "linear-gradient(10deg, #ff8a15, #ff3131)",
        "fire-hover": "linear-gradient(10deg, #ffac15, #ff3131)",
      },
      borderRadius: {
        ig: "10px",
        "ig-sm": "7px",
      },
      fontFamily: {
        barlow: ["var(--font-barlow)", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

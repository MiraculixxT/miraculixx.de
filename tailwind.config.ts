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
        site: {
          bg: "#0b0916",
          panel: "#151129",
          raised: "#1d1838",
          line: "#2f2560",
          dim: "#6f66a8",
          muted: "#8b7cff",
          soft: "#bdb3ff",
          text: "#e9e4ff",
          accent: "#ff4d6d",
          gold: "#ffe27a",
        },
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
        pixel: ["var(--font-pixel)", "monospace"],
        silk: ["var(--font-silk)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
        term: ["var(--font-term)", "monospace"],
        mc: ["var(--font-mc)", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;

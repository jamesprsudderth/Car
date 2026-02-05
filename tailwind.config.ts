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
        bg: "#f5f6fa",
        surface: "#ffffff",
        accent: "#22c55e",
        "accent-hover": "#16a34a",
        "accent-light": "#f0fdf4",
        primary: "#1e293b",
        text: "#1e293b",
        "text-secondary": "#64748b",
        "text-muted": "#94a3b8",
        border: "#e2e8f0",
        "border-light": "#f1f5f9",
        danger: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Instrument Serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        sidebar: "2px 0 8px 0 rgb(0 0 0 / 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#050807",
          surface: "#0B1210",
          panel: "#0E1714",
          border: "#1A2B25",
          green: "#39FF88",
          cyan: "#00D9FF",
          red: "#FF003C",
          amber: "#FFB800",
          text: "#F3F7F5",
          muted: "#87938D",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Fira Code", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(57, 255, 136, 0.2), inset 0 0 15px rgba(57, 255, 136, 0.05)",
        "neon-cyan": "0 0 20px rgba(0, 217, 255, 0.2), inset 0 0 15px rgba(0, 217, 255, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;


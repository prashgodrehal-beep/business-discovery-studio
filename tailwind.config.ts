import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        scan: {
          bg: "#0b1020",
          surface: "#121936",
          surface2: "#182147",
          border: "#2a3568",
          text: "#eef3ff",
          muted: "#9fb0d0",
          teal: "#00d4ff",
          tealDim: "#123449",
          amber: "#f59e0b",
          amberDim: "#4a3315",
          green: "#22c55e",
          greenDim: "#173824",
          accent: "#7c5cff",
        },
      },
      fontFamily: {
        display: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-body)", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "5%": { opacity: "1" },
          "95%": { opacity: "1" },
          "100%": { transform: "translateY(var(--scan-distance, 400px))", opacity: "0" },
        },
        scanlineX: {
          "0%": { transform: "translateX(0)", opacity: "0" },
          "5%": { opacity: "1" },
          "95%": { opacity: "1" },
          "100%": { transform: "translateX(var(--scan-distance, 400px))", opacity: "0" },
        },
      },
      animation: {
        scanline: "scanline 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        scanlineX: "scanlineX 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;

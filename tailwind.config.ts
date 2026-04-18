import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        // AOP / AI Showcase canvas palette
        canvas: {
          DEFAULT: "#050914",       // page background
          raised: "#0b1120",        // card / surface
          elevated: "#101a30",      // hover / emphasised surface
          sidebar: "#0a0f1f",       // sidebar / rail
          line: "rgba(255,255,255,0.05)",
          "line-strong": "rgba(255,255,255,0.10)",
        },
        // Accent colors mirroring AOP departments + AI Showcase
        accent: {
          sky: "#38bdf8",       // CS / primary / AI
          emerald: "#34d399",   // Sales / success
          amber: "#fbbf24",     // Partner / warn
          violet: "#a78bfa",    // Support / special
          rose: "#fb7185",      // alerts
        },
      },
      letterSpacing: {
        eyebrow: "0.25em",
        "eyebrow-wide": "0.30em",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        "soft-dark":
          "0 10px 30px -12px rgba(0,0,0,0.55), 0 4px 12px -6px rgba(0,0,0,0.35)",
        "soft-dark-lg":
          "0 24px 60px -18px rgba(0,0,0,0.75), 0 10px 24px -10px rgba(0,0,0,0.45)",
        "ring-sky": "0 0 0 3px rgba(56,189,248,0.25)",
      },
      backgroundImage: {
        "canvas-radial":
          "radial-gradient(1100px 500px at 10% -10%, rgba(56,189,248,0.10), transparent 60%), radial-gradient(900px 450px at 110% 10%, rgba(167,139,250,0.08), transparent 55%), radial-gradient(700px 400px at 50% 110%, rgba(52,211,153,0.05), transparent 60%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

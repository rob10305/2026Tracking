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
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e5ff",
          200: "#bcd2ff",
          300: "#8fb4ff",
          400: "#5c8bff",
          500: "#3b66f5",
          600: "#2547e0",
          700: "#1d36b8",
          800: "#1c2f91",
          900: "#1c2d75",
          950: "#141c49",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f7f8fb",
          subtle: "#f0f2f7",
          strong: "#e5e7ef",
        },
        ink: {
          DEFAULT: "#0b1020",
          soft: "#343a4a",
          muted: "#6b7280",
          faint: "#9ca3af",
        },
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.15rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "soft-sm": "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.03)",
        soft: "0 4px 12px -2px rgb(15 23 42 / 0.06), 0 2px 6px -2px rgb(15 23 42 / 0.04)",
        "soft-lg": "0 14px 40px -12px rgb(15 23 42 / 0.18), 0 6px 16px -6px rgb(15 23 42 / 0.08)",
        "soft-xl": "0 24px 60px -16px rgb(15 23 42 / 0.25), 0 10px 24px -8px rgb(15 23 42 / 0.10)",
        "inner-soft": "inset 0 1px 0 0 rgb(255 255 255 / 0.6)",
        glow: "0 0 0 3px rgb(59 102 245 / 0.18)",
      },
      backgroundImage: {
        "app-gradient":
          "radial-gradient(1200px 600px at 10% -10%, rgba(59,102,245,0.08), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(147,51,234,0.06), transparent 55%), linear-gradient(180deg, #f7f8fb 0%, #eef1f7 100%)",
        "nav-gradient":
          "linear-gradient(135deg, #0b1020 0%, #141c49 55%, #1c2d75 100%)",
        "brand-gradient":
          "linear-gradient(135deg, #3b66f5 0%, #7a5cff 60%, #b74cff 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.9" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "shimmer": "shimmer 1.6s linear infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "sans-serif",
        ],
      },
      colors: {
        zone: {
          void: "rgb(var(--tw-zone-void) / <alpha-value>)",
          deep: "rgb(var(--tw-zone-deep) / <alpha-value>)",
          panel: "rgb(var(--tw-zone-panel) / <alpha-value>)",
          edge: "rgb(var(--tw-zone-edge) / <alpha-value>)",
          muted: "rgb(var(--tw-zone-muted) / <alpha-value>)",
          fog: "rgb(var(--tw-zone-fog) / <alpha-value>)",
        },
        archi: {
          50: "rgb(var(--tw-archi-50) / <alpha-value>)",
          100: "rgb(var(--tw-archi-100) / <alpha-value>)",
          200: "rgb(var(--tw-archi-200) / <alpha-value>)",
          300: "rgb(var(--tw-archi-300) / <alpha-value>)",
          400: "rgb(var(--tw-archi-400) / <alpha-value>)",
          500: "rgb(var(--tw-archi-500) / <alpha-value>)",
          600: "rgb(var(--tw-archi-600) / <alpha-value>)",
          700: "rgb(var(--tw-archi-700) / <alpha-value>)",
          800: "rgb(var(--tw-archi-800) / <alpha-value>)",
          900: "rgb(var(--tw-archi-900) / <alpha-value>)",
        },
      },
      boxShadow: {
        zone: "var(--tw-shadow-zone)",
        "zone-inset": "inset 0 0 100px rgba(0,0,0,0.6)",
        "zone-glow": "var(--tw-shadow-zone-glow)",
      },
      backgroundImage: {
        "rad-glow": "var(--tw-rad-glow)",
      },
      keyframes: {
        "zone-flicker": {
          "0%, 100%": { opacity: "1" },
          "48%": { opacity: "1" },
          "49%": { opacity: "0.92" },
          "50%": { opacity: "1" },
          "88%": { opacity: "0.98" },
          "90%": { opacity: "1" },
        },
        "rad-glow-soft": {
          "0%, 100%": {
            textShadow:
              "0 0 18px rgb(var(--tw-brand-glow-1) / 0.28), 0 0 42px rgb(var(--tw-brand-glow-2) / 0.1)",
          },
          "50%": {
            textShadow:
              "0 0 32px rgb(var(--tw-brand-glow-3) / 0.45), 0 0 58px rgb(var(--tw-brand-glow-4) / 0.16), 0 0 1px rgb(var(--tw-brand-glow-5) / 0.12)",
          },
        },
        "scan-breathe": {
          "0%, 100%": { opacity: "0.055" },
          "50%": { opacity: "0.095" },
        },
        "pda-enter": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "zone-flicker": "zone-flicker 5s ease-in-out infinite",
        "rad-glow-soft": "rad-glow-soft 4.5s ease-in-out infinite",
        "scan-breathe": "scan-breathe 10s ease-in-out infinite",
        "pda-enter": "pda-enter 0.55s ease-out backwards",
      },
    },
  },
  plugins: [],
};

export default config;

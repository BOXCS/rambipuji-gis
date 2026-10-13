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
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        mono: ["var(--font-sans)", "monospace"],
      },
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-subtle": "var(--color-primary-subtle)",
        secondary: "var(--color-secondary)",
        "secondary-subtle": "var(--color-secondary-subtle)",
        tertiary: "var(--color-tertiary)",
        "tertiary-subtle": "var(--color-tertiary-subtle)",
        neutral: "var(--color-neutral)",
        "neutral-subtle": "var(--color-neutral-subtle)",
        "cat-pertanian": "var(--cat-pertanian)",
        "cat-pertanian-subtle": "var(--cat-pertanian-subtle)",
        "cat-umkm": "var(--cat-umkm)",
        "cat-umkm-subtle": "var(--cat-umkm-subtle)",
        "cat-wisata": "var(--cat-wisata)",
        "cat-wisata-subtle": "var(--cat-wisata-subtle)",
        "cat-infrastruktur": "var(--cat-infrastruktur)",
        "cat-infrastruktur-subtle": "var(--cat-infrastruktur-subtle)",
      },
      boxShadow: {
        floating: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
        glow: "0 0 25px -5px rgba(29, 106, 71, 0.35)",
        "card-hover": "0 20px 40px -15px rgba(0, 0, 0, 0.18)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        kenburns: "kenburns 15s ease-out infinite alternate",
      },
      spacing: {
        "space-xs": "4px",
        "space-sm": "8px",
        "space-md": "16px",
        "space-lg": "24px",
        "space-xl": "32px",
      },
    },
  },
  plugins: [],
};
export default config;

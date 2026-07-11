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
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-inter)", "monospace"],
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

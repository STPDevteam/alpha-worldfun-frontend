import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./libs/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "messina-sans": ["var(--font-messina-sans)", "sans-serif"],
        "office-times-round": ["var(--font-office-times-round)", "serif"],
        "dm-mono": ["var(--font-dm-mono)", "monospace"],
        "bdo-grotesk": ["var(--font-bdo-grotesk)", "sans-serif"],
        "manrope": ["var(--font-manrope)", "sans-serif"],
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    }),
  ],
} satisfies Config;

import type { Config } from "tailwindcss"

export default {
  theme: {
    extend: {
      fontFamily: {
        "gochi-hand": "var(--font-gochi-hand)",
        sans: "var(--font-gochi-hand), sans-serif",
      },
    },
  },
} satisfies Config

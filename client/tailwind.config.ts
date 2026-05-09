import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070E1D",
          900: "#0A1328",
          800: "#0F1C3A"
        },
        sand: {
          50: "#FAF7F1",
          100: "#F3EBDD",
          200: "#E7D8BF"
        },
        gold: {
          300: "#F0D38C",
          400: "#E7C46C",
          500: "#D8AE4A",
          600: "#B88D2F"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["\"Playfair Display\"", "ui-serif", "Georgia"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(231,196,108,0.25), 0 20px 80px rgba(7,14,29,0.55)"
      }
    }
  },
  plugins: []
} satisfies Config;


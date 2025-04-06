import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom color theme
        lime: {
          50: "#fcffe4",
          100: "#f8ffc4",
          200: "#efff90",
          300: "#dfff50",
          400: "#c8ff00",
          500: "#aee600",
          600: "#87b800",
          700: "#668b00",
          800: "#516d07",
          900: "#445c0b",
          950: "#223400",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Weather animations
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "raindrop": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.7" },
          "70%": { transform: "translateY(25px) scale(1)", opacity: "0.7" },
          "100%": { transform: "translateY(30px) scale(0)", opacity: "0" },
        },
        "heavyrain": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.8" },
          "80%": { transform: "translateY(35px) scale(1)", opacity: "0.8" },
          "100%": { transform: "translateY(40px) scale(0)", opacity: "0" },
        },
        "snowfall": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "0.9" },
          "70%": { transform: "translateY(25px) rotate(180deg)", opacity: "0.9" },
          "100%": { transform: "translateY(30px) rotate(360deg)", opacity: "0" },
        },
        "lightning": {
          "0%, 15%, 31%, 47%, 60%, 77%, 91%, 100%": { opacity: "0" },
          "14%, 30%, 46%, 59%, 76%, 90%": { opacity: "0.4" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Weather animations
        "float": "float 3s ease-in-out infinite",
        "pulse": "pulse 2s ease-in-out infinite",
        "raindrop": "raindrop 1.5s ease-in infinite",
        "heavyrain": "heavyrain 1s ease-in infinite",
        "snowfall": "snowfall 2s ease-in-out infinite",
        "lightning": "lightning 3s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

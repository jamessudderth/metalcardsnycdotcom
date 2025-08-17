import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Custom Metal Cards NYC color palette
        emerald: {
          DEFAULT: "hsl(158, 64%, 52%)",
          dark: "hsl(158, 64%, 42%)",
          light: "hsl(158, 64%, 62%)",
        },
        gold: {
          DEFAULT: "hsl(45, 92%, 47%)",
          dark: "hsl(45, 92%, 37%)",
          light: "hsl(45, 92%, 57%)",
        },
        'deep-black': {
          DEFAULT: "hsl(0, 0%, 8%)",
          light: "hsl(0, 0%, 12%)",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%) skewX(-12deg)" },
          "100%": { transform: "translateX(200%) skewX(-12deg)" },
        },
        "float-1": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)", opacity: "0.7" },
          "25%": { transform: "translateY(-10px) rotate(90deg)", opacity: "1" },
          "50%": { transform: "translateY(-5px) rotate(180deg)", opacity: "0.8" },
          "75%": { transform: "translateY(-15px) rotate(270deg)", opacity: "0.9" },
        },
        "float-2": {
          "0%, 100%": { transform: "translateY(0) translateX(0)", opacity: "0.6" },
          "33%": { transform: "translateY(-8px) translateX(5px)", opacity: "1" },
          "66%": { transform: "translateY(-12px) translateX(-3px)", opacity: "0.8" },
        },
        "float-3": {
          "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.5" },
          "50%": { transform: "translateY(-6px) scale(1.2)", opacity: "1" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        "glow-emerald": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(16, 185, 129, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)" },
        },
        "glow-gold": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255, 215, 0, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s ease-in-out infinite",
        "float-1": "float-1 3s ease-in-out infinite",
        "float-2": "float-2 4s ease-in-out infinite 0.5s",
        "float-3": "float-3 5s ease-in-out infinite 1s",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "glow-emerald": "glow-emerald 2s ease-in-out infinite",
        "glow-gold": "glow-gold 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

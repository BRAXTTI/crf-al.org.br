/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#003366",
          foreground: "#ffffff",
          light: "#0066CC",
          dark: "#0B192C",
        },
        secondary: {
          DEFAULT: "#00875A",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#E2E8F0",
          foreground: "#003366",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        crfal: {
          blue: "#003366",
          "blue-dark": "#0B192C",
          "blue-light": "#0066CC",
          "blue-lighter": "#E6F0F8",
          white: "#ffffff",
          gray: "#F8FAFC",
          "gray-medium": "#E2E8F0",
          "gray-dark": "#1E293B",
          "text-gray": "#64748B",
          "gray-50": "#F8FAFC",
          "gray-100": "#F1F5F9",
          "gray-200": "#E2E8F0",
          "gray-300": "#b4c2d1",
          "gray-400": "#9ba8b8",
          "gray-500": "#8a9bb0",
          "gray-600": "#64748B",
          "gray-700": "#334155",
          "gray-800": "#1e293b",
          "gray-900": "#0f172a",
          green: "#00875A",
          "green-light": "#E6F5EF",
          gold: "#C59B27",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 2px 4px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 20px 40px rgba(0, 33, 64, 0.13)",
        header: "0 4px 20px rgba(0, 33, 64, 0.09)",
      },
      fontFamily: {
        sans: ['Rawline', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Rawline', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

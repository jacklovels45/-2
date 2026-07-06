/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: "#EEF5F0",
          100: "#D5E5D9",
          200: "#A9C8B2",
          300: "#7AAB89",
          400: "#4D8B61",
          500: "#2C6B41",
          600: "#1E5534",
          700: "#163F27",
          800: "#0F3D2E",
          900: "#0A2B20",
          950: "#061A14",
        },
        amber: {
          50: "#FBF6EC",
          100: "#F4E6C5",
          200: "#EAD08A",
          300: "#E0BA56",
          400: "#D4A24C",
          500: "#C28A33",
          600: "#A3711F",
          700: "#7E561A",
          800: "#5C3F12",
          900: "#3D290B",
        },
        cream: {
          50: "#FDFBF5",
          100: "#F9F4E8",
          200: "#F5F1E8",
          300: "#EEE5CF",
          400: "#E2D4B0",
        },
        ink: {
          50: "#F4F5F3",
          100: "#E3E5DF",
          200: "#C5C8BF",
          300: "#9CA097",
          400: "#6E7368",
          500: "#4A4E47",
          600: "#333732",
          700: "#262925",
          800: "#1A1F1C",
          900: "#0F120F",
        },
        signal: {
          orange: "#E07A3F",
          teal: "#5BA8A0",
          rose: "#C25B6E",
          violet: "#7E6BA8",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,61,46,0.04), 0 4px 16px rgba(15,61,46,0.06)",
        cardHover: "0 2px 6px rgba(15,61,46,0.08), 0 10px 28px rgba(15,61,46,0.10)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
        gold: "0 8px 24px rgba(212,162,76,0.25)",
      },
      borderRadius: {
        xl2: "14px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "draw-line": {
          "0%": { "stroke-dashoffset": "1000" },
          "100%": { "stroke-dashoffset": "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "draw-line": "draw-line 1.2s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

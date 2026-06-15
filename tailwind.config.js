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
        space: {
          950: "#050a16",
          900: "#0a1628",
          800: "#0f1f3a",
          700: "#162a4f",
          600: "#1f3a68",
          500: "#2a4f86",
        },
        accent: {
          amber: "#ff8c42",
          orange: "#f97316",
          teal: "#2dd4bf",
          cyan: "#06b6d4",
        },
        metal: {
          500: "#5a6a80",
          600: "#465263",
          700: "#343d4a",
          800: "#242b35",
        },
        gizmo: {
          x: "#ef4444",
          y: "#22c55e",
          z: "#3b82f6",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "'PingFang SC'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
        sans: ["'Noto Sans SC'", "'PingFang SC'", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 30px rgba(255,140,66,0.35)",
        panel: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      animation: {
        pulse_slow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out both",
        "slide-right": "slideRight 0.4s ease-out both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideRight: {
          "0%": { opacity: 0, transform: "translateX(16px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

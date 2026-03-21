/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F5811A",
        "primary-dark": "#C45E00",
        accent: "#F2A623",
        background: "#FFFDF9",
        card: "#FFFFFF",
        textPrimary: "#1C1C1C",
        muted: "#6B6B6B",
        success: "#22C55E",
        error: "#EF4444"
      },
      boxShadow: {
        card: "0 18px 40px rgba(245, 129, 26, 0.12)",
        panel: "0 28px 80px rgba(86, 40, 7, 0.18)"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Fraunces", "serif"]
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.94) translateY(12px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" }
        },
        "soft-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-6px)" },
          "70%": { transform: "translateY(2px)" }
        },
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "drawer-in": {
          "0%": { opacity: "0", transform: "translateX(28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        }
      },
      animation: {
        "pop-in": "pop-in 0.35s ease-out",
        "soft-bounce": "soft-bounce 0.45s ease-out",
        "fade-slide-up": "fade-slide-up 0.45s ease-out",
        "drawer-in": "drawer-in 0.35s ease-out"
      }
    }
  },
  plugins: []
};

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // BMW Blue — primary brand
        bmw: {
          50:  "#e6f0ff",
          100: "#cce0ff",
          200: "#99c2ff",
          300: "#66a3ff",
          400: "#3385ff",
          500: "#0066cc",
          600: "#0052a3",
          700: "#003d7a",
          800: "#002952",
          900: "#001429",
        },
        // Dark graphite
        graphite: {
          50:  "#f4f4f5",
          100: "#e4e4e7",
          200: "#d1d1d6",
          300: "#a0a0ab",
          400: "#6b6b7b",
          500: "#3a3a4a",
          600: "#2a2a38",
          700: "#1e1e2a",
          800: "#141420",
          900: "#0a0a12",
          950: "#06060d",
        },
        // Semantic accent colors
        danger:  { DEFAULT: "#ff4444", light: "#ff6b6b", dark: "#cc0000" },
        success: { DEFAULT: "#00d97e", light: "#34e89e", dark: "#00a85a" },
        warning: { DEFAULT: "#ff9500", light: "#ffb340", dark: "#cc7600" },
        // Section accent palette
        violet:  { DEFAULT: "#8b5cf6", light: "#a78bfa", dark: "#6d28d9", glow: "rgba(139,92,246,0.25)" },
        rose:    { DEFAULT: "#f43f5e", light: "#fb7185", dark: "#be123c",  glow: "rgba(244,63,94,0.25)" },
        amber:   { DEFAULT: "#f59e0b", light: "#fbbf24", dark: "#b45309",  glow: "rgba(245,158,11,0.25)" },
        teal:    { DEFAULT: "#14b8a6", light: "#2dd4bf", dark: "#0f766e",  glow: "rgba(20,184,166,0.25)" },
        sky:     { DEFAULT: "#0ea5e9", light: "#38bdf8", dark: "#0369a1",  glow: "rgba(14,165,233,0.25)" },
        emerald: { DEFAULT: "#10b981", light: "#34d399", dark: "#047857",  glow: "rgba(16,185,129,0.25)" },
        indigo:  { DEFAULT: "#6366f1", light: "#818cf8", dark: "#4338ca",  glow: "rgba(99,102,241,0.25)" },
        fuchsia: { DEFAULT: "#d946ef", light: "#e879f9", dark: "#a21caf",  glow: "rgba(217,70,239,0.25)" },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "SF Pro Display", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "SF Mono", "monospace"],
        display: ["var(--font-inter)", "SF Pro Display", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-in":   "fadeIn 0.4s ease-out forwards",
        "slide-up":  "slideUp 0.5s cubic-bezier(0.32,0.72,0,1) forwards",
        "scale-in":  "scaleIn 0.3s cubic-bezier(0.32,0.72,0,1) forwards",
        "shimmer":   "shimmer 2s linear infinite",
        "float":     "float 6s ease-in-out infinite",
        "glow-pulse":"glowPulse 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "breathe":   "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { from: { opacity: "0" },                                  to: { opacity: "1" } },
        slideUp:   { from: { transform: "translateY(24px)", opacity: "0" },   to: { transform: "translateY(0)", opacity: "1" } },
        scaleIn:   { from: { transform: "scale(0.92)", opacity: "0" },        to: { transform: "scale(1)", opacity: "1" } },
        shimmer:   { from: { backgroundPosition: "-200% 0" },                 to:  { backgroundPosition: "200% 0" } },
        float:     { "0%,100%": { transform: "translateY(0)" },               "50%": { transform: "translateY(-10px)" } },
        glowPulse: { "0%,100%": { opacity: "0.6" },                           "50%": { opacity: "1" } },
        breathe:   { "0%,100%": { transform: "scale(1)" },                    "50%": { transform: "scale(1.04)" } },
      },
      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        // Brand gradients
        "gradient-bmw":       "linear-gradient(135deg, #3385ff 0%, #0066cc 50%, #003d7a 100%)",
        "gradient-bmw-vivid": "linear-gradient(135deg, #60a5fa 0%, #3385ff 40%, #0066cc 100%)",
        // Section card header gradients
        "gradient-weather":   "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
        "gradient-road":      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "gradient-rider":     "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        "gradient-moto":      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-route":     "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
        "gradient-stops":     "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "gradient-dangers":   "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
        "gradient-ai":        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        "gradient-equip":     "linear-gradient(135deg, #d946ef 0%, #a21caf 100%)",
        "gradient-fuel":      "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        "gradient-timeline":  "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
        "gradient-emergency": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        // Score gradients
        "gradient-score-100": "linear-gradient(135deg, #00d97e 0%, #00a85a 100%)",
        "gradient-score-80":  "linear-gradient(135deg, #3385ff 0%, #0066cc 100%)",
        "gradient-score-60":  "linear-gradient(135deg, #ff9500 0%, #cc7600 100%)",
        "gradient-score-40":  "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)",
        // Dark
        "gradient-dark":      "linear-gradient(180deg, #141420 0%, #0a0a12 100%)",
        "shimmer-gradient":   "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
      },
      boxShadow: {
        "glass":      "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glass-lg":   "0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)",
        "bmw":        "0 4px 24px rgba(0,102,204,0.3)",
        "bmw-lg":     "0 8px 40px rgba(0,102,204,0.45)",
        "success":    "0 4px 20px rgba(0,217,126,0.3)",
        "warning":    "0 4px 20px rgba(255,149,0,0.3)",
        "danger":     "0 4px 20px rgba(255,68,68,0.3)",
        "violet":     "0 4px 20px rgba(139,92,246,0.3)",
        "teal":       "0 4px 20px rgba(20,184,166,0.3)",
        "inner-top":  "inset 0 1px 0 rgba(255,255,255,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;

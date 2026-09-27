/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ─── Color Palette ────────────────────────────────────────────────────
      colors: {
        // Background hierarchy (Obsidian slate depth)
        canvas: "#0A0E17",
        base: "#0F1523",
        surface: {
          0: "#141B2D",
          1: "#1B243B",
          2: "#24304D",
          3: "#2F3E63",
        },
        inp: "#0C111C",

        // Primary brand (Cobalt / Sapphire)
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#0F172A",
        },

        // Editorial Accents
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },

        // Accent colors
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#0EA5E9",

        // Border tokens (using opacity-aware values via CSS vars)
        "border-hairline": "rgba(255,255,255,0.06)",
        "border-subtle": "rgba(255,255,255,0.10)",
        "border-default": "rgba(255,255,255,0.15)",
        "border-strong": "rgba(255,255,255,0.26)",
      },

      // ─── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        sm: ["13px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "22px" }],
        md: ["15px", { lineHeight: "24px" }],
        lg: ["17px", { lineHeight: "26px" }],
        xl: ["20px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
        "3xl": ["30px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
        "4xl": ["36px", { lineHeight: "42px", letterSpacing: "-0.03em" }],
        "5xl": ["48px", { lineHeight: "54px", letterSpacing: "-0.04em" }],
        "6xl": ["64px", { lineHeight: "68px", letterSpacing: "-0.04em" }],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },

      // ─── Spacing / Sizing ─────────────────────────────────────────────────
      borderRadius: {
        none: "0",
        xs: "4px",
        sm: "8px",
        DEFAULT: "10px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },

      // ─── Shadows ──────────────────────────────────────────────────────────
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.5)",
        sm: "0 2px 8px rgba(0,0,0,0.4)",
        md: "0 8px 24px rgba(0,0,0,0.5)",
        lg: "0 20px 60px rgba(0,0,0,0.6)",
        xl: "0 32px 80px rgba(0,0,0,0.7)",
        "brand-sm": "0 4px 14px rgba(99,102,241,0.25)",
        "brand-md": "0 8px 28px rgba(99,102,241,0.35)",
        "brand-lg": "0 16px 48px rgba(99,102,241,0.4)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.05)",
        none: "none",
      },

      // ─── Transitions ──────────────────────────────────────────────────────
      transitionDuration: {
        fast: "120ms",
        normal: "200ms",
        slow: "350ms",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      // ─── Animations ───────────────────────────────────────────────────────
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out forwards",
        "slide-up": "slideUp 250ms ease-out forwards",
        "slide-in-left": "slideInLeft 250ms ease-out forwards",
        "scale-in": "scaleIn 200ms ease-out forwards",
        shimmer: "shimmer 2.5s infinite linear",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        spin: "spin 1s linear infinite",
      },

      // ─── Layout ───────────────────────────────────────────────────────────
      maxWidth: {
        sidebar: "260px",
        chat: "480px",
        prose: "680px",
        stage: "1200px",
      },
      zIndex: {
        base: "0",
        raised: "10",
        overlay: "20",
        modal: "50",
        toast: "60",
        top: "100",
      },
    },
  },
  plugins: [],
};

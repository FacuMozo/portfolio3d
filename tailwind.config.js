/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---- Legacy (Ocean / Classic) ----
        gray: {
          200: "#D5DAE1"
        },
        black: {
          DEFAULT: "#000",
          500: "#1D2235"
        },
        blue: {
          500: "#2971db" // was #2b77e7 (4.29:1 on white); darkened to pass WCAG AA
        },

        // ---- Professional site (design tokens from the Stitch design) ----
        // Accent colors are CSS variables (RGB triplets) so the hero easter egg can swap the
        // palette at runtime; values per palette live in src/site/site.css ([data-palette]).
        surface: {
          bg: "#0D0D0F",
          lowest: "#0E0E10",
          DEFAULT: "#131315",
          container: "#201F21",
          high: "#2A2A2C",
          card: "#18181C",
          "card-hover": "#222228",
        },
        "border-subtle": "#282830",
        "border-prominent": "#3F3F4D",
        "text-primary": "#EDEDF0",
        "text-secondary": "#A6A6B0",
        // Stitch used #60606B (≈3.3:1 on the page background): raised to pass WCAG AA (≥4.5:1).
        "text-muted": "#8B8B96",
        "on-surface": "#E5E1E4",
        "on-surface-variant": "#CCC3D8",
        "accent-violet": "rgb(var(--c-accent) / <alpha-value>)",
        // Lighter violet for small text on dark cards (#A855F7 is only ~3.6:1 there).
        "accent-lilac": "rgb(var(--c-accent-text) / <alpha-value>)",
        "accent-cyan": "rgb(var(--c-accent-2) / <alpha-value>)",
        "accent-coral": "rgb(var(--c-accent-3) / <alpha-value>)",
        "syntax-comment": "#00E599",
        "primary-container": "rgb(var(--c-primary) / <alpha-value>)",
        "inverse-primary": "rgb(var(--c-primary-strong) / <alpha-value>)",
        "quote-blue": "#0369A1",
        error: "#FFB4AB",
        tertiary: "#FFB95F",
      },
      fontFamily: {
        worksans: ["Work Sans", "sans-serif"],
        poppins: ['Poppins', "sans-serif"],
        display: ['"Space Grotesk Variable"', '"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter Variable"', "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
      fontSize: {
        "display-hero": ["clamp(2.5rem, 1.6rem + 4.5vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" }],
        "headline-xl": ["clamp(2rem, 1.6rem + 2vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["clamp(1.5rem, 1.3rem + 1vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["1.5rem", { lineHeight: "1.25", fontWeight: "600" }],
        "headline-sm": ["1.125rem", { lineHeight: "1.35", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "body-md": ["0.9375rem", { lineHeight: "1.6rem" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.25rem" }],
        "code-snippet": ["0.8125rem", { lineHeight: "1.25rem" }],
        "code-badge": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.04em", fontWeight: "500" }],
        "nav-comment": ["0.875rem", { lineHeight: "1.125rem", letterSpacing: "0.02em", fontWeight: "500" }],
      },
      spacing: {
        gutter: "1.5rem",
        margin: "2rem",
        "space-3xl": "6rem",
      },
      keyframes: {
        pingOnce: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '30%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'ping-once': 'pingOnce 0.45s ease-out',
      },
      boxShadow: {
        card: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [],
}

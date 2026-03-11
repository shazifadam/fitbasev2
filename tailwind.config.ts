import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '428px' },
    },
    extend: {
      // ─── Font Family ─────────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // ─── Font Weight — ONLY normal (400) and medium (500) ────────────
      fontWeight: {
        normal: '400',
        medium: '500',
        // semibold and bold are intentionally excluded
      },
      // ─── Border Radius ───────────────────────────────────────────────
      // base (4px)  → buttons, inputs, badges, tags, chips, toasts, tooltips
      // card (12px) → cards, containers, modals, drawers (outer shell)
      // full        → avatars, FAB, set-number circles, completion checkboxes
      borderRadius: {
        none: '0',
        base: '0.25rem',   // 4px
        card: '0.75rem',   // 12px
        full: '9999px',
        // Aliases for clarity in components
        sm: '0.25rem',     // 4px — same as base
        md: '0.75rem',     // 12px — same as card
        lg: '1rem',        // reserved
      },
      // ─── Colors ──────────────────────────────────────────────────────
      colors: {
        // Neutral / Gray (core palette)
        neutral: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',  // Primary action color
          900: '#171717',  // Hover state
          950: '#0a0a0a',  // Primary text
        },
        // FAB accent — pink/burgundy ONLY for floating action button
        fab: {
          DEFAULT: '#9d174d',  // pink.800
          hover:   '#831843',  // pink.900
          active:  '#500724',  // pink.950
        },
        // Semantic — success
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        // Semantic — warning
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          700: '#b45309',
          900: '#78350f',
        },
        // Semantic — danger
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Session tracking — weight input focus highlight
        session: {
          focus: '#e87040',
        },
      },
      // ─── Spacing ─────────────────────────────────────────────────────
      // Using default Tailwind spacing scale — no overrides needed
      // ─── Shadows ─────────────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        nav:  '0 -1px 4px 0 rgb(0 0 0 / 0.08)',
        fab:  '0 4px 12px 0 rgb(157 23 77 / 0.3)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config

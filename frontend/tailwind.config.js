/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: '#0F172A',
          foreground: '#F8FAFC',
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        debt: {
          current: {
            text: '#059669',
            bg: '#ECFDF5',
            border: '#A7F3D0',
            darkText: '#34D399',
            darkBg: '#064E3B',
          },
          warning: {
            text: '#D97706',
            bg: '#FFFBEB',
            border: '#FDE68A',
            darkText: '#FBBF24',
            darkBg: '#451A03',
          },
          critical: {
            text: '#E11D48',
            bg: '#FFF1F2',
            border: '#FECDD3',
            darkText: '#FB7185',
            darkBg: '#4C0519',
          },
          negotiating: {
            text: '#0284C7',
            bg: '#F0F9FF',
            border: '#BAE6FD',
            darkText: '#38BDF8',
            darkBg: '#0C4A6E',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'drawer': '-10px 0 25px -5px rgba(0, 0, 0, 0.1), -8px 0 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}

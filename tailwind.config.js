/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kiroku: {
          bg: '#0a0b12',
          sidebar: '#07080d',
          card: '#121420',
          'card-hover': '#181b2c',
          border: '#1e2235',
          'border-light': '#2a2f48',
          purple: {
            DEFAULT: '#7c3aed',
            light: '#9061f9',
            dark: '#5b21b6',
            glow: 'rgba(124, 58, 237, 0.25)',
          },
          lime: '#a3e635',
          gold: '#facc15',
          text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
            muted: '#64748b',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

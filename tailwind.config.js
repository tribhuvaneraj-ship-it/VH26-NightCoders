/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0D10',
        card: '#12161C',
        surface: '#171B22',
        border: '#252A32',
        primary: '#4F7CFF',
        adaptive: '#8B5CF6',
        healthy: '#22C55E',
        warning: '#F59E0B',
        critical: '#EF4444',
        textPrimary: '#F5F7FA',
        textSecondary: '#8B93A3',
        textMuted: '#5E6675',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}

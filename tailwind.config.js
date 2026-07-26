/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        humm: {
          bg: '#0A0E17',
          card: '#121826',
          border: '#1E293B',
          accent: '#06B6D4', // Cyan 500
          accentGlow: 'rgba(6, 182, 212, 0.25)',
          resonance: '#10B981', // Emerald 500
          gold: '#F59E0B', // Amber 500
          textMuted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.4)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

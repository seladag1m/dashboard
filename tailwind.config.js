
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./App.tsx", "./index.tsx", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./services/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0F172A', blue: '#246BFD', slate: '#F8FAFC' },
        strike: '#8B5CF6', // Violet for strike zones
        risk: '#F43F5E', // Rose for threats
        accent: { DEFAULT: '#246BFD', hover: '#1B54D8', subtle: 'rgba(36, 107, 253, 0.08)' }
      },
      fontFamily: {
        satoshi: ['Satoshi', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        'source-serif': ['Source Serif 4', 'serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'float': '0 20px 50px -12px rgba(36, 107, 253, 0.15)',
        'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 32px 0 rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'reveal': 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        reveal: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
      },
    },
  },
}

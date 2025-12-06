
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // 1️⃣ COLOR SYSTEM (CONSULTING-GRADE PALETTE)
        // Backgrounds
        bg: {
          main: '#FFFFFF',
          soft: '#F7F8FA',
          neutral: '#E3E7EC',
        },
        // Text
        text: {
          headline: '#0B0E11', // H1, H2
          primary: '#0E1A2B',  // Body
          secondary: '#4A5564', // Subtext
          light: '#9CA3AF',    // Placeholder/Disabled
        },
        // Accent (High-trust AI blue)
        accent: {
          DEFAULT: '#296CFF',  // Bright Consult Blue
          hover: '#0B3CBA',    // Deep Indigo Blue
          light: '#EFF6FF',    // 50 shade for backgrounds
          subtle: 'rgba(41, 108, 255, 0.1)',
        },
        // Utilities
        success: { DEFAULT: '#10B981', light: '#D1FAE5' },
        warning: { DEFAULT: '#FBBF24', light: '#FEF3C7' },
        error: { DEFAULT: '#EF4444', light: '#FEE2E2' },
        
        // Map legacy names to new palette to prevent breaking
        zinc: {
          900: '#0E1A2B', // Deep Navy
          800: '#1E293B',
          500: '#4A5564', // Slate Grey
          400: '#94A3B8',
          200: '#E3E7EC', // Neutral Grey
          100: '#F7F8FA', // Soft Grey
          50: '#F9FAFB',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(14, 26, 43, 0.08)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'float': '0 12px 30px -10px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 15px rgba(41, 108, 255, 0.25)',
        'input': '0 2px 6px rgba(0,0,0,0.02)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.98)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
    },
  },
  plugins: [],
}

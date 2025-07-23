/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.jsx"
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00bfff',
        'yellow-cta': '#ffcc00',
        'deep-black': '#0a0a0a',
      },
      backgroundImage: {
        'neural-gradient': 'radial-gradient(circle at 20% 50%, rgba(0, 191, 255, 0.1) 0%, transparent 50%)',
        'hero-gradient': 'linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(255, 204, 0, 0.05) 100%)',
      },
      animation: {
        'neural-pulse': 'neural-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'rocket-launch': 'rocket-launch 0.6s ease-out',
        'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        'neural-pulse': {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        'rocket-launch': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.1)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
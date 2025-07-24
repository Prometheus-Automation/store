/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // Enable class-based dark mode for premium feel
  theme: {
    extend: {
      // Psychological color palette based on Labrecque's 2020 study
      colors: {
        // Primary trust colors (blue increases credibility by 33%)
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          500: '#334155',
          700: '#1e293b',
          900: '#001f3f', // Primary navy for headers/text
        },
        primary: {
          50: '#e6f7ff',
          100: '#b3e8ff',
          400: '#33ccff',
          500: '#00bfff', // Innovation/calm CTA color
          600: '#0099cc',
          700: '#007399',
        },
        // Premium neutral background (high contrast >4.5:1 WCAG)
        bg: '#f8fafc',
        surface: '#ffffff',
        // Gray scale for optimal readability
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563', // High contrast text
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Status colors for trust signals
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      // Minimalist animations (remove rocket for Musk-level elegance)
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Typography for intelligence signaling
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      // Spacing for consistent layouts (Cialdini's consistency principle)
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
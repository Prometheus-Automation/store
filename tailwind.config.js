/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // Enable class-based dark mode for premium feel
  theme: {
    extend: {
      // Cosmic Energy Palette - Dark-first approach based on screenshot analysis
      colors: {
        // Cosmic background spectrum
        'cosmic-bg': '#0a0a1e',     // Deep navy-black base
        'neural-navy': '#001f3f',   // Neural network blue
        'energy-cyan': '#00bfff',   // Bright cyan accent
        'nebula-red': '#b22222',    // Muted red accent
        'node-teal': '#00ffaa',     // Teal green highlight
        'cosmic-white': '#ffffff',  // Pure white text
        
        // Legacy colors for compatibility
        navy: '#001f3f',
        primary: '#00bfff', 
        bg: '#0a0a1e',              // Dark-first background
        surface: '#001f3f',         // Dark surface
        
        // Dark-optimized gray scale
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        
        // Cosmic accent colors
        'neural-blue': '#0066cc',
        'energy-purple': '#6366f1',
        'cosmic-violet': '#8b5cf6',
        
        // Enhanced nebula colors for Best Sellers section
        'navy-dark': '#0a0a1e',
        'navy-light': '#191970',
        
        // Status colors optimized for dark theme
        success: '#22c55e',
        warning: '#fbbf24',
        error: '#ef4444',
      },
      backgroundImage: {
        // Neural energy gradients
        'neural-gradient': 'linear-gradient(135deg, rgba(0,31,63,0.3) 0%, rgba(25,25,112,0.2) 50%, rgba(0,31,63,0.3) 100%)',
        'cosmic-gradient': 'linear-gradient(135deg, #0a0a1e 0%, #001f3f 50%, #191970 100%)',
        'energy-burst': 'linear-gradient(135deg, rgba(0,191,255,0.1) 0%, rgba(99,102,241,0.1) 50%, rgba(139,92,246,0.1) 100%)',
        'neural-pulse': 'radial-gradient(circle at center, rgba(0,191,255,0.2) 0%, rgba(0,31,63,0.1) 70%, transparent 100%)',
        'cosmic-overlay': 'linear-gradient(to bottom, rgba(10,10,30,0.4) 0%, rgba(0,31,63,0.3) 50%, rgba(25,25,112,0.2) 100%)',
        
        // Pulsing energy flow gradients
        'energy-flow-1': 'linear-gradient(90deg, transparent 0%, rgba(0,191,255,0.3) 50%, transparent 100%)',
        'energy-flow-2': 'linear-gradient(45deg, transparent 0%, rgba(99,102,241,0.3) 50%, transparent 100%)',
        'energy-flow-3': 'linear-gradient(135deg, transparent 0%, rgba(139,92,246,0.3) 50%, transparent 100%)',
        
        // Nebula overlay for Best Sellers section
        'nebula-overlay': "url('/nebula-red.png')",
        
        // Smooth inviting gradient using website's cyan-purple-teal palette
        'inviting-gradient': 'linear-gradient(90deg, #00bfff 0%, #6366f1 40%, #8b5cf6 70%, #00ffaa 100%)',
      },
      // Neural energy animations - Cosmic pulse effects
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        'neural-pulse': 'neural-pulse 3s ease-in-out infinite',
        'energy-flow': 'energy-flow 4s ease-in-out infinite',
        'cosmic-glow': 'cosmic-glow 2s ease-in-out infinite alternate',
        'neural-breathe': 'neural-breathe 6s ease-in-out infinite',
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
        'neural-pulse': {
          '0%': { opacity: '0.03', transform: 'scale(1)' },
          '50%': { opacity: '0.08', transform: 'scale(1.05)' },
          '100%': { opacity: '0.03', transform: 'scale(1)' },
        },
        'energy-flow': {
          '0%': { 
            backgroundPosition: '0% 50%',
            opacity: '0.2'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            opacity: '0.4'
          },
          '100%': { 
            backgroundPosition: '0% 50%',
            opacity: '0.2'
          },
        },
        'cosmic-glow': {
          '0%': { 
            boxShadow: '0 0 10px rgba(0,191,255,0.2)',
            opacity: '0.8'
          },
          '100%': { 
            boxShadow: '0 0 20px rgba(0,191,255,0.4), 0 0 30px rgba(99,102,241,0.2)',
            opacity: '1'
          },
        },
        'neural-breathe': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '33%': { transform: 'scale(1.02)', opacity: '0.8' },
          '66%': { transform: 'scale(0.98)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '0.6' },
        },
      },
      // Typography for intelligence signaling
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
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
      // Text shadow for Apple-inspired glow effects
      textShadow: {
        'glow': '0 0 5px rgba(0, 191, 255, 0.5)',
        'glow-sharp': '0 0 3px rgba(0, 191, 255, 0.3)',
        'none': 'none',
      },
    },
  },
  plugins: [],
}
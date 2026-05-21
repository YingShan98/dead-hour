import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dead Hour colour palette — dark, desaturated, with a single blood-red accent
        background: '#0d0d0d',
        surface: '#161616',
        border: '#2a2a2a',
        muted: '#4a4a4a',
        text: '#c8c8b4', // warm off-white, like aged paper
        'text-dim': '#7a7a6a',
        accent: '#b03030', // muted blood red
        'accent-hover': '#cc3333',
        safe: '#4a7c5f', // muted green — health, safety
        warning: '#b08030', // muted amber — low resources
        danger: '#8b2020', // deep red — critical state
      },
      fontFamily: {
        // Display: used for titles and scene headings
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        // Body: used for narrative text — readable at length
        body: ['"Crimson Text"', 'Georgia', 'serif'],
        // Mono: used for stats, numbers, UI labels
        ui: ['"Share Tech Mono"', 'monospace'],
      },
      fontSize: {
        narrative: ['1.125rem', { lineHeight: '1.85' }], // comfortable long-form reading
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        flicker: 'flicker 4s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.85' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.9' },
          '97%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

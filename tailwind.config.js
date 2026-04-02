/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#070810',
        'electric-violet': '#7C3AED',
        'neon-cyan': '#06B6D4',
        'plasma-gold': '#F59E0B',
        'ghost-white': '#F8F8FF',
        'dim-slate': '#94A3B8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'tape-scroll': 'tapeScroll 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px #7C3AED' },
          '50%': { boxShadow: '0 0 24px #7C3AED, 0 0 48px #7C3AED40' },
        }
      }
    }
  },
  plugins: []
};

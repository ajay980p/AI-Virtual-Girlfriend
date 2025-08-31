/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: '#1a1a1a',
        'card-foreground': '#ffffff',
        popover: '#1a1a1a',
        'popover-foreground': '#ffffff',
        primary: '#8b5cf6',
        'primary-foreground': '#ffffff',
        secondary: '#2a2a2a',
        'secondary-foreground': '#e5e5e5',
        muted: '#262626',
        'muted-foreground': '#a3a3a3',
        accent: '#7c3aed',
        'accent-foreground': '#ffffff',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#2a2a2a',
        input: '#1a1a1a',
        ring: '#8b5cf6'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace']
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.5rem'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px'
      },
      animation: {
        'gradient': 'gradient 6s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'bounce-subtle': 'bounceSubtle 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite'
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms'
      },
      blur: {
        '3xl': '64px',
        '4xl': '128px'
      }
    }
  },
  plugins: []
}
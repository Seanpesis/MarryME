/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['var(--font-playfair)', 'Georgia', 'serif'],
        'body': ['var(--font-rubik)', 'sans-serif'],
        'hebrew': ['var(--font-rubik)', 'sans-serif'],
      },
      colors: {
        champagne: {
          50: '#fdf8f0',
          100: '#faefd8',
          200: '#f4ddb0',
          300: '#ecc67f',
          400: '#e4aa4e',
          500: '#dc9229',
          600: '#c4771e',
          700: '#a35c19',
          800: '#84491a',
          900: '#6c3d18',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ede4',
          200: '#cbdbc9',
          300: '#a3bfa0',
          400: '#759f71',
          500: '#548150',
          600: '#40673d',
          700: '#345233',
          800: '#2b422b',
          900: '#243724',
        },
        blush: {
          50: '#fef5f5',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f7afaf',
          400: '#f18080',
          500: '#e85555',
          600: '#d43535',
          700: '#b22929',
          800: '#942626',
          900: '#7b2525',
        },
        ivory: '#faf8f5',
        'dark-brown': '#1a0f0a',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'phone-appear': 'phoneAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'message-in': 'messageIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'typing': 'typing 1.5s steps(20) infinite',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'confetti': 'confetti 3s ease-in-out forwards',
        'counter': 'counter 2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        phoneAppear: {
          '0%': { opacity: '0', transform: 'scale(0.7) translateY(40px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        messageIn: {
          '0%': { opacity: '0', transform: 'scale(0.8) translateX(-20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateX(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(220, 146, 41, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(220, 146, 41, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(220, 146, 41, 0)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(300px) rotate(720deg)', opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-1': 'radial-gradient(at 40% 20%, hsla(35, 80%, 85%, 0.8) 0, transparent 50%), radial-gradient(at 80% 0%, hsla(140, 30%, 80%, 0.6) 0, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 60%, 88%, 0.6) 0, transparent 50%)',
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(26, 15, 10, 0.15), 0 4px 6px -4px rgba(26, 15, 10, 0.1)',
        'card': '0 4px 24px rgba(26, 15, 10, 0.08)',
        'card-hover': '0 12px 48px rgba(26, 15, 10, 0.16)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      },
    },
  },
  plugins: [],
}

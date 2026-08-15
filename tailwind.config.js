/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        peacock: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#00a896',
          700: '#028090',
          800: '#0f4c81',
          900: '#0a2b4c',
          950: '#051628',
        },
        gold: {
          100: '#fef9e7',
          200: '#fcf0c3',
          300: '#f8e18f',
          400: '#f3ce56',
          500: '#d4af37',
          600: '#c5a059',
          700: '#b8860b',
          800: '#916709',
          900: '#6c4a06',
        },
        ivory: {
          50: '#ffffff',
          100: '#fdfbf7',
          200: '#faf6f0',
          300: '#f4ede2',
          400: '#e8dbca',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-[#D4AF37], linear-[#F3E5AB], linear-[#AA771C]',
        'peacock-gradient': 'linear-to-r from-[#0F4C81] via-[#028090] to-[#00A896]',
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.35)',
        'peacock-glow': '0 0 25px rgba(15, 76, 129, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

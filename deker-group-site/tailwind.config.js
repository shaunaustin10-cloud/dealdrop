/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6725', // NextHome Orange
        midnight: '#1A1A1A', // Darker Luxury Black
        sand: '#FFFFFF', // Pure White
        'sand-dark': '#F5F5F0', // Warm Light Grey
        'slate-light': '#8A8A8A', // Muted Grey
        'luxury-gold': '#C5A059', // Muted Gold/Bronze
        'cream': '#FAFAF9', // Stone/Cream
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['EB Garamond', 'serif'],
      },
      letterSpacing: {
        'luxury': '.15em',
      }
    },
  },
  plugins: [],
}

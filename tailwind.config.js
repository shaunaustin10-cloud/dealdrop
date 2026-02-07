/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#10B981', // Emerald 500 (Original)
        secondary: '#00B579', 
        accent: '#FF3F25', 
        charcoal: '#333333', // NextHome Charcoal
        grey: '#999999', // NextHome Grey
        'bg-cream': '#FFF8F4', 
        'bg-cream-dark': '#F5EDE8',
        'midnight': '#020617', // Slate 950
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Fallback for Gordita
        serif: ['EB Garamond', 'serif'], // Hozn $sub-font
      }
    },
  },
  plugins: [],
}

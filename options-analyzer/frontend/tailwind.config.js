/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'base-white': '#FFFFFF',
        'base-light': '#F7F7F7',
        'base-border': '#EAEAEA',
        'base-text': '#000000',
        'base-muted': '#8A8A8A',
        'brand': '#00c805', // Robinhood Green
        'brand-light': '#E6F9E6',
        'success': '#00c805',
        'warning': '#FFB000',
        'danger': '#FF5000', // Robinhood Red
      },
      fontFamily: {
        // Fallbacks for standard sleek UI, mimicking RH's 'Capsule' font vibe
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 4px 12px rgba(0, 0, 0, 0.03)',
        'modal': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}

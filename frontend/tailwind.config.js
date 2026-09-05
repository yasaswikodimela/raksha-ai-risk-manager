/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        raksha: {
          dark: '#0f172a',
          gold: '#d4af37',
          goldlight: '#fde047',
          golddark: '#b48e28',
          bg: '#fafafa',
          panel: '#ffffff',
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}


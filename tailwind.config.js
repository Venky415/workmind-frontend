/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: '#4F46E5', dark: '#3730A3', light: '#EEF2FF' }
      }
    }
  },
  plugins: []
};

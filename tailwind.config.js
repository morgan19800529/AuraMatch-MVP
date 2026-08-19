/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 500: '#e11d48', 600: '#e11d48' },
        jade: { 50: '#f0fdf4', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        gold: { 50: '#fffbeb', 100: '#fef3c7', 300: '#fcd34d', 500: '#f59e0b', 700: '#b45309' }
      }
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        youtube: {
          red: '#FF0000',
          dark: '#0F0F0F',
          light: '#FFFFFF',
          gray: '#272727',
          'gray-light': '#AAAAAA',
        }
      }
    },
  },
  plugins: [],
} 
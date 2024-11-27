/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0a192f',
          light: '#112240',
          dark: '#020c1b',
        },
      },
    },
  },
  plugins: [],
}

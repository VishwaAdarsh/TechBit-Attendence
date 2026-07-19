/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gameDark: '#05070F',
        gameNavy: '#0B132B',
        gameBlue: '#1C2541',
        gameElectric: '#3A506B',
        gameCyan: '#00F0FF',
        gamePurple: '#8A2BE2',
        gameAccent: '#5BC0BE'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}

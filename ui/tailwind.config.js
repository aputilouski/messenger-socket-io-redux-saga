/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2979ff',
        secondary: '#673ab7',
      },

      // fontFamily: {
      //   sans: ["'Comfortaa', cursive"],
      // },
    },
  },
  plugins: [],
};

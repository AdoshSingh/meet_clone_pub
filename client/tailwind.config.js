/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgc: '#d6cfc7',
        card: '#fafafa',
      },
      width: {
        '400': '400px',
        '600': '600px',
        '300': '300px',
        '250': '250px',
        '500': '500px',
        '470': '420px',
      },
      height:{
        '400': '400px',
        '600': '600px',
        '300': '300px',
        '250': '250px',
        '500': '500px',
        '470': '420px',
      }
    },
  },
  plugins: [],
}


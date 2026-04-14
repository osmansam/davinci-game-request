/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        germania: ['Germania One', 'cursive'],
        merriweather: ['Merriweather', 'serif'],
      },
      colors: {
        'light-brown': '#F7D8B9',
        'dark-brown': '#614222',
        'cream-bg': '#EFE0CF',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07131f',
        midnight: '#0c2131',
        harbor: '#0e7c86',
        tide: '#2bc4b6',
        ivory: '#f7f3ea',
        mist: '#e8eef2',
        brass: '#c89b56',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 60px rgba(7, 19, 31, 0.14)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          400: '#2ebfd3',
          500: '#11a9bc',
          600: '#0e8a9a',
        },
      },
    },
  },
  plugins: [],
};

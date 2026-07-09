/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 뉴어드민 팔레트 계승 (LBS 최소 세트)
        primary: {
          1000: '#0A1650',
        },
        navy: {
          400: '#767A90',
          1000: '#0A1650',
        },
        point: {
          danger: '#E42412',
          warn: '#FFAB10',
        },
        gray: {
          100: '#fafafa',
          200: '#f3f3f3',
          300: '#eeeeee',
          400: '#d3d3d3',
          500: '#b2b2b2',
          600: '#9F9F9F',
          700: '#666666',
          800: '#3C3C3C',
        },
      },
      fontFamily: {
        pretendard: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

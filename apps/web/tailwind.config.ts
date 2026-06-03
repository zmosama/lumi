import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4F72',
          50: '#EBF5FB',
          100: '#D6EAF8',
          200: '#AED6F1',
          300: '#85C1E9',
          400: '#5DADE2',
          500: '#2E86C1',
          600: '#1B4F72',
          700: '#154360',
          800: '#0E2D4E',
          900: '#071723',
        },
        secondary: {
          DEFAULT: '#2E86C1',
        },
        accent: {
          DEFAULT: '#F39C12',
          50: '#FEF9E7',
          100: '#FDEBD0',
          200: '#FAD7A0',
          300: '#F8C471',
          400: '#F5B041',
          500: '#F39C12',
          600: '#D68910',
          700: '#B7770D',
        },
        success: '#27AE60',
        danger: '#E74C3C',
        background: '#F8F9FA',
        card: '#FFFFFF',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        ibm: ['"IBM Plex Arabic"', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        input: '4px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;

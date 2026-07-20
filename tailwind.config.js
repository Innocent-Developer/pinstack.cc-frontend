/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './config/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#059669', hover: '#047857', bright: '#10B981' },
        bgAlt: '#F0FDF4',
        heading: '#0F172A',
        body: '#475569',
        muted: '#94A3B8',
        borderC: '#E2E8F0',
        success: '#15803D',
        successBg: '#F0FDF4',
        featured: '#D97706',
      },
      borderRadius: {
        card: '10px',
        btn: '8px',
      },
    },
  },
  plugins: [],
};

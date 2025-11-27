/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom color palette inspired by professional service portals
      colors: {
        // Primary brand color - deep teal
        'brand': {
          50: '#e6f7f7',
          100: '#b3e6e6',
          200: '#80d4d4',
          300: '#4dc2c2',
          400: '#26b5b5',
          500: '#009999',
          600: '#008080',
          700: '#006666',
          800: '#004d4d',
          900: '#003333',
        },
        // Accent color - warm amber
        'accent': {
          50: '#fff8e6',
          100: '#ffebb3',
          200: '#ffdd80',
          300: '#ffd04d',
          400: '#ffc526',
          500: '#ffb800',
          600: '#cc9400',
          700: '#997000',
          800: '#664b00',
          900: '#332600',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}


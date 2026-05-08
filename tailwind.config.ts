import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark teal — matches the logo
        parchment: {
          DEFAULT: '#0e2d2a',
          card: '#163530',
          dark: '#1c4040',
        },
        ink: {
          DEFAULT: '#f2ead8',
          light: '#d4c5a0',
          muted: '#a89070',
        },
        gold: {
          DEFAULT: '#c8a84b',
          light: '#e8d89a',
          dark: '#9b7e30',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        amiri: ['var(--font-amiri)', 'serif'],
        playfair: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

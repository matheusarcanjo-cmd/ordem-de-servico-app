import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        asfalto: { DEFAULT: '#1e2124', claro: '#2b2f33' },
        faixa: '#f5c518', // amarelo de faixa de pista
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

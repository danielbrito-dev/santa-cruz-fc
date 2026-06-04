import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        red: '#DD0000',
        gold: '#C9B896',
        gray: '#D6D7D8',
        ink: '#0A0A0A',
      },
      fontFamily: { sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'] },
      maxWidth: { container: '1320px' },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1E2A5A',
          soft: '#3B4A7E',
        },
        azure: {
          DEFAULT: '#2E7BE8',
          dark: '#1E5FC2',
          tint: '#EAF2FE',
        },
        line: '#E5EAF2',
        muted: '#5B6B85',
        surface: '#FBFCFE',
        danger: '#DC2626',
        success: '#0F9D58',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      maxWidth: {
        content: '860px',
        wide: '1120px',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,42,90,0.04), 0 8px 24px rgba(30,42,90,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;

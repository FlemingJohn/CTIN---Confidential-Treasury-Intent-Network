import type { Config } from 'tailwindcss';

const tailwindConfiguration: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './source/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        obsidian: {
          base: '#050505',
          raised: '#0b0b0d',
          panel: '#111114',
          border: '#1f1f24',
        },
        magma: {
          ember: '#ff6b1a',
          core: '#f97316',
          flame: '#e11d2a',
          deep: '#b91c1c',
          glow: '#ffd7a8',
        },
        signal: {
          confidential: '#f59e0b',
          settled: '#22c55e',
          pending: '#eab308',
          reverted: '#ef4444',
        },
      },
      backgroundImage: {
        'fissure-gradient':
          'radial-gradient(circle at 50% 120%, rgba(255,107,26,0.18), transparent 55%)',
        'grid-lines':
          'linear-gradient(to right, #1a1a1f 1px, transparent 1px), linear-gradient(to bottom, #1a1a1f 1px, transparent 1px)',
      },
      keyframes: {
        emberPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        riseFade: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        emberPulse: 'emberPulse 2.4s ease-in-out infinite',
        riseFade: 'riseFade 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default tailwindConfiguration;

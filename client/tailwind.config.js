/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'var(--paper)',
          raised: 'var(--paper-raised)',
        },
        sand: {
          2: 'var(--sand-2)',
          3: 'var(--sand-3)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
          ghost: 'var(--ink-ghost)',
        },
        line: 'var(--line)',
        scrim: 'var(--scrim)',
        brand: {
          DEFAULT: 'var(--brand)',
          on: 'var(--on-brand)',
        },
        rust: 'var(--rust)',
        venmo: 'var(--venmo)',
        status: {
          error: 'var(--error)',
        },
      },
      fontFamily: {
        sans: ['"Archivo"', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      borderWidth: {
        DEFAULT: '1.5px',
      },
      borderColor: {
        DEFAULT: 'var(--ink)',
      },
    },
  },
  plugins: [],
};

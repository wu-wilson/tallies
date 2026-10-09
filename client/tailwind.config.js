/** Maps a channel-format CSS variable to a Tailwind colour that honours opacity modifiers (`bg-ink/40`). */
const ch = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Hover styles only where a pointer can hover, so a tapped row on a phone doesn't stay tinted.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        ground: ch('--ground'),
        surface: ch('--surface'),
        ink: {
          DEFAULT: ch('--ink'),
          2: ch('--ink-2'),
          3: ch('--ink-3'),
          4: ch('--ink-4'),
          5: ch('--ink-5'),
        },
        line: {
          DEFAULT: ch('--line'),
          soft: ch('--line-soft'),
          strong: ch('--line-strong'),
        },
        wash: ch('--wash'),
        settled: {
          DEFAULT: ch('--settled'),
          wash: ch('--settled-wash'),
        },
        coral: ch('--coral'),
        error: {
          DEFAULT: ch('--error'),
          wash: ch('--error-wash'),
        },
        venmo: ch('--venmo'),
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgb(var(--line))',
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--ink) / 0.04)',
        float: '0 1px 2px rgb(var(--ink) / 0.04), 0 12px 32px -12px rgb(var(--ink) / 0.18), 0 32px 64px -32px rgb(var(--ink) / 0.16)',
        segment: '0 0 0 1px rgb(var(--ink) / 0.06), 0 1px 2px rgb(var(--ink) / 0.08)',
        sheet: '0 -12px 40px -16px rgb(var(--ink) / 0.24)',
      },
    },
  },
  plugins: [],
};

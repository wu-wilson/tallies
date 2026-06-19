import React from 'react';
import { motion } from 'framer-motion';

import { TallyLogo } from '../common/TallyLogo';

import { useBillStore } from '../../store/billStore';

/** Grid paper backdrop drawn behind the marketing page, tinted with the hairline-grid token. */
const GRID_BG: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(var(--line-grid) 1px, transparent 1px), linear-gradient(90deg, var(--line-grid) 1px, transparent 1px)',
  backgroundSize: '30px 30px',
};

const STEPS = [
  { n: '01', title: 'Add your receipts', body: 'Snap a photo or drop in up to 20 at once — Tallies reads every line, tax and tip.' },
  { n: '02', title: 'Assign the items', body: 'Tap each dish onto whoever ordered it. Shared a plate? Split any item evenly.' },
  { n: '03', title: 'Share the link', body: 'Drop one link in the group chat. Everyone sees their share and pays you on Venmo.' },
] as const;

/**
 * Marketing front door — brand nav, hero, how-it-works band, and footer. Its primary CTA hands off into
 * the capture flow.
 * @returns The full marketing landing layout
 */
export const MarketingScreen: React.FC = () => {
  const setScreen = useBillStore((s) => s.setScreen);

  return (
    <div className="min-h-dvh" style={GRID_BG}>
      {/* Nav — bar spans full width; its content aligns with the max-w-3xl column used by every section. */}
      <nav className="border-b border-ink bg-paper px-5 py-4 sm:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <TallyLogo size={22} />
            <span className="text-xl font-black tracking-tight sm:text-[22px]">TALLIES</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-ink px-5 py-14 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex border border-ink bg-paper px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.04em] sm:text-xs">
            BILL SPLITTING — MINUS THE MATH
          </span>
          <h1 className="mt-7 text-5xl font-black leading-[0.9] tracking-tight sm:text-7xl">
            Scan it. Split it.
            <span className="mt-3 inline-block bg-brand px-3 text-brand-on">Settle it.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Tallies turns a crumpled receipt into an even, itemized split in seconds — tax and tip handled,
            everyone pays you back on Venmo.
          </p>
          <motion.button
            onClick={() => setScreen('capture')}
            className="mt-9 bg-brand px-7 py-4 text-base font-extrabold text-brand-on transition-[filter] hover:brightness-110"
            whileTap={{ scale: 0.98 }}
          >
            Upload a receipt &rarr;
          </motion.button>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs font-bold text-ink-muted">
            <span>— Free forever</span>
            <span>— No accounts</span>
            <span>— Pay via Venmo</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-ink bg-sand-3 px-5 py-14 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs font-bold text-brand">HOW IT WORKS</span>
            <span className="text-2xl font-black tracking-tight sm:text-3xl">Three steps. No spreadsheet.</span>
          </div>
          <div className="mt-7 grid border border-ink sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className={`bg-paper-raised p-6 ${i < STEPS.length - 1 ? 'border-b border-ink sm:border-b-0 sm:border-r' : ''}`}
              >
                <div className="font-mono text-xs font-bold text-rust">STEP {step.n}</div>
                <div className="mt-2 text-xl font-black tracking-tight">{step.title}</div>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-12 sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-4xl font-black tracking-tight sm:text-5xl">TALLIES</div>
            <div className="mt-2.5 font-mono text-xs text-ink-muted">Keep tallies on every tab.</div>
            <div className="mt-1.5 font-mono text-[11px] text-ink-ghost">A free, solo passion project.</div>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs font-bold">
            <a
              href="https://github.com/wu-wilson/tallies"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-[filter] hover:brightness-150"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" className="shrink-0">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

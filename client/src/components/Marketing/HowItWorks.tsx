import React from 'react';

import { AssignPanel, ScanPanel, SharePanel } from './HowItWorksPanels';

const STEPS = [
  { verb: 'Scan', rest: 'every receipt', body: 'Add photos of one receipt or twenty. Tallies reads each line, the tax and the tip.', Panel: ScanPanel },
  {
    verb: 'Assign',
    rest: 'who had what',
    body: 'Tap a name onto each item. Shared plates split evenly, and tax and tip follow what each person ordered.',
    Panel: AssignPanel,
  },
  { verb: 'Share', rest: 'one link', body: 'Friends open the link, find their name and pay you on Venmo. Nobody needs an account.', Panel: SharePanel },
];

/**
 * "From receipt to repaid": the three steps on the left take turns, each with a filling progress line, while the
 * matching screen shows on a dotted panel beside them. The cycle is pure CSS (`how-*` in `index.css`) and rests on
 * step 1 under reduced motion.
 * @returns The how-it-works section
 */
export const HowItWorks: React.FC = () => (
  <section id="how" className="scroll-mt-6 px-5 pt-24 sm:px-6">
    <div className="mx-auto max-w-[1200px]">
      <h2 tabIndex={-1} className="max-w-[640px] text-[clamp(28px,2.6vw,38px)] font-light focus:outline-none leading-[1.12] tracking-[-0.03em] [text-wrap:balance]">
        From receipt to repaid. <span className="text-ink-4">Three steps, and nobody does math.</span>
      </h2>
      <div className="mt-10 grid overflow-hidden rounded-2xl border border-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <ol className="border-b border-line px-6 py-3 sm:px-9 lg:border-b-0 lg:border-r">
          {STEPS.map((step, i) => (
            <li key={step.verb} className={`how-step-${i + 1} relative py-5 ${i < STEPS.length - 1 ? 'border-b border-line' : ''}`}>
              <div className="flex items-baseline gap-3.5">
                <span
                  className={`how-badge-${i + 1} flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${
                    i === 0 ? 'border-ink bg-ink text-white' : 'border-line-strong bg-surface text-ink-3'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-[17px] font-medium tracking-[-0.015em]">
                  {step.verb} <span className="text-ink-3">{step.rest}</span>
                </span>
              </div>
              <p className="ml-9 mt-2 text-[14.5px] leading-relaxed text-ink-2">{step.body}</p>
              <span className="absolute -bottom-px left-9 right-0 h-px overflow-hidden">
                <span className={`how-progress how-progress-${i + 1} block h-px origin-left bg-ink`} />
              </span>
            </li>
          ))}
        </ol>
        <div className="relative min-h-[400px] bg-ground bg-[radial-gradient(rgb(var(--line-strong))_1px,transparent_1px)] bg-[length:16px_16px]" aria-hidden="true">
          {STEPS.map(({ verb, Panel }, i) => (
            <div key={verb} className={`how-panel-${i + 1} absolute inset-0 flex items-center justify-center p-6 sm:p-8`}>
              <Panel />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

import React from 'react';

import { BrandBar } from '../common/BrandBar';
import { Icon } from '../common/Icon';
import { Lockup } from '../common/Lockup';
import { BUTTON_PRIMARY, LINK_MUTED } from '../common/styles';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Specs } from './Specs';

import { useBillStore } from '../../store/billStore';

/**
 * The landing page on white: brand bar, the hero with its live demo, how it works, the specs, a closing call to
 * action, and a quiet footer with the source link. Every call to action starts a new bill.
 * @returns The full landing layout
 */
export const MarketingScreen: React.FC = () => {
  const startNewBill = useBillStore((s) => s.startNewBill);

  return (
    <div className="min-h-dvh overflow-x-clip bg-surface">
      <BrandBar />
      <main>
        <Hero />
        <HowItWorks />
        <Specs />
        <section className="px-5 pb-28 pt-28 sm:px-6">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-7">
            <h2 className="max-w-[620px] text-[clamp(32px,3.2vw,46px)] font-light leading-[1.08] tracking-[-0.035em] [text-wrap:balance]">
              Settle up before the check comes back. <span className="text-ink-4">It takes about a minute.</span>
            </h2>
            <button type="button" onClick={startNewBill} className={`group h-12 px-5 text-[15px] ${BUTTON_PRIMARY}`}>
              Split a bill
              <Icon name="chevron-right" size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>
      </main>
      <footer className="border-t border-line px-5 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-9 pt-7 text-[13.5px]">
          <div className="flex items-center gap-3">
            <Lockup size="sm" />
            <span className="text-ink-3">A free, solo passion project.</span>
          </div>
          <a
            href="https://github.com/wu-wilson/tallies"
            target="_blank"
            rel="noopener noreferrer"
            className={`relative before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] ${LINK_MUTED}`}
          >
            View the source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

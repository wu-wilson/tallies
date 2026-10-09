import React from 'react';

import { Icon } from '../common/Icon';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../common/styles';
import { HeroStage } from './HeroStage';

import { useBillStore } from '../../store/billStore';

/**
 * Landing hero: a light two-tone headline, one line of copy, the "Split a bill" call to action beside a link
 * to how it works, and the live demo over the giant tally.
 * @returns The hero section
 */
export const Hero: React.FC = () => {
  const startNewBill = useBillStore((s) => s.startNewBill);

  // Scroll to the steps without adding a `#how` history entry, which Back would later land on mid-page.
  const handleHowItWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const section = document.getElementById('how');
    section?.scrollIntoView();
    section?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  };

  return (
    <section className="px-5 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] lg:min-h-[640px] lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        <div className="flex flex-col justify-center pb-14 pt-16 lg:pr-10 lg:pt-[72px]">
          <h1 tabIndex={-1} className="text-[clamp(38px,3.9vw,56px)] focus:outline-none font-light leading-[1.06] tracking-[-0.035em] [text-wrap:balance]">
            Split any bill in seconds. <span className="text-ink-4">Everyone pays you back.</span>
          </h1>
          <p className="mt-6 max-w-[440px] text-[17px] leading-relaxed text-ink-2 [text-wrap:pretty]">
            Scan the receipt, tap who had what, and send one link. Tax and tip are split fairly, and friends pay you
            on Venmo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={startNewBill} className={`group h-12 px-5 text-[15px] ${BUTTON_PRIMARY}`}>
              Split a bill
              <Icon name="chevron-right" size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
            <a href="#how" onClick={handleHowItWorksClick} className={`h-12 px-5 text-[15px] ${BUTTON_SECONDARY}`}>
              How it works
            </a>
          </div>
          <p className="mt-5 text-[13.5px] text-ink-3">Free to use. No accounts for you or your friends.</p>
        </div>
        <HeroStage />
      </div>
    </section>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';

import { BrandBar } from './BrandBar';
import { TallyLogo } from './TallyLogo';

import { useBillStore } from '../../store/billStore';

/**
 * Brutalist not-found screen — the brand bar, the tally logo in a framed tile, a mono eyebrow, headline, and a
 * CTA that starts a fresh bill. Used for both unknown routes and expired or invalid shared links.
 * @returns Full-viewport centered not-found layout
 */
export const NotFound: React.FC = () => {
  const startNewBill = useBillStore((s) => s.startNewBill);

  return (
    <div className="flex min-h-dvh flex-col">
      <BrandBar />

      <div className="flex flex-1 flex-col items-center justify-center px-7 py-12 text-center">
        <div className="flex h-[88px] w-[88px] items-center justify-center border-2 border-ink bg-paper-raised">
          <TallyLogo size={44} />
        </div>

        <p className="mt-6 font-mono text-[11px] font-bold tracking-[0.1em] text-rust">NO TALLY HERE</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Bill not found</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
          This link may be invalid, or the bill may have expired. Shared bills last 30 days.
        </p>

        <Link
          to="/"
          onClick={startNewBill}
          className="mt-7 bg-brand px-7 py-3.5 text-sm font-extrabold text-brand-on transition-[filter] hover:brightness-110"
        >
          Start a new split &rarr;
        </Link>
      </div>
    </div>
  );
};

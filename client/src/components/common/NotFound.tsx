import React from 'react';
import { Link } from 'react-router-dom';

import { TallyLogo } from './TallyLogo';

import { useBillStore } from '../../store/billStore';

interface NotFoundProps {
  /** Mono eyebrow above the headline. Defaults to the bill-not-found code. */
  eyebrow?: string;
  /** Large headline. Defaults to "Bill not found". */
  title?: string;
  /** Supporting line under the headline. Defaults to the expiry explanation. */
  message?: string;
}

/**
 * Brutalist not-found screen — a struck-through tally glyph with a code eyebrow, headline, and a CTA back
 * to the marketing front door. Used for both unknown routes and expired/invalid shared links.
 * @param props - Optional eyebrow, title, and message overrides
 * @returns Full-viewport centered not-found layout
 */
export const NotFound: React.FC<NotFoundProps> = ({
  eyebrow = '404 · NO TALLY HERE',
  title = 'Bill not found',
  message = 'This link may be invalid, or the bill may have expired. Shared bills last 30 days.',
}) => {
  const setScreen = useBillStore((s) => s.setScreen);

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-2 border-b border-ink px-5 py-3">
        <TallyLogo size={16} />
        <span className="text-sm font-black tracking-tight">TALLIES</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-7 py-12 text-center">
        <div className="relative flex h-[88px] w-[88px] items-center justify-center border-2 border-ink bg-paper-raised">
          <span className="flex h-10 items-end gap-1.5 opacity-40">
            <i className="block h-10 w-[5px] bg-ink" />
            <i className="block h-10 w-[5px] bg-ink" />
            <i className="block h-10 w-[5px] bg-ink" />
            <i className="block h-10 w-[5px] bg-ink" />
          </span>
          <span className="absolute inset-x-2 top-1/2 h-1.5 -translate-y-1/2 -rotate-[24deg] bg-rust" />
        </div>

        <p className="mt-6 font-mono text-[11px] font-bold tracking-[0.1em] text-rust">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">{message}</p>

        <Link
          to="/"
          onClick={() => setScreen('landing')}
          className="mt-7 bg-brand px-7 py-3.5 text-sm font-extrabold text-brand-on transition-[filter] hover:brightness-110"
        >
          Start your own split &rarr;
        </Link>
      </div>
    </div>
  );
};

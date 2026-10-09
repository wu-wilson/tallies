import React from 'react';
import { Link } from 'react-router-dom';

import { BrandBar } from './BrandBar';
import { Icon } from './Icon';
import { BUTTON_PRIMARY } from './styles';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBillStore } from '../../store/billStore';

/**
 * Not-found screen for unknown routes and expired or invalid shared links: the brand bar over a light two-tone
 * headline, a short explanation, and a button that starts a fresh bill.
 * @returns Full-viewport not-found layout
 */
export const NotFound: React.FC = () => {
  useDocumentTitle('Not found · Tallies');
  const startNewBill = useBillStore((s) => s.startNewBill);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <BrandBar />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-[13px] font-medium text-ink-3">Link not found</p>
        <h1 className="mt-3 max-w-lg text-[clamp(30px,4vw,44px)] font-light leading-[1.08] tracking-[-0.035em] [text-wrap:balance]">
          This bill isn't here. <span className="text-ink-4">It may have expired.</span>
        </h1>
        <p className="mt-4 max-w-sm text-[15px] text-ink-2 [text-wrap:pretty]">
          Shared bills last 30 days. Ask whoever sent the link for a new one, or split a bill of your own.
        </p>
        <Link to="/" onClick={startNewBill} className={`mt-8 h-12 px-5 text-[15px] ${BUTTON_PRIMARY}`}>
          Split a bill
          <Icon name="chevron-right" size={14} />
        </Link>
      </main>
    </div>
  );
};

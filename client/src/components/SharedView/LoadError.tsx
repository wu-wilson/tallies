import React from 'react';

import { BrandBar } from '../common/BrandBar';
import { BUTTON_PRIMARY } from '../common/styles';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface LoadErrorProps {
  /** User-safe reason the bill didn't load, when known. */
  message: string | null;
  onRetry: () => void;
}

/**
 * Shown when a shared bill fails to load for a reason other than a missing link (an outage, a rate limit, no
 * connection), laid out like the not-found screen with a button that fetches again.
 * @param props - The failure message and a retry handler
 * @returns Full-viewport error layout
 */
export const LoadError: React.FC<LoadErrorProps> = ({ message, onRetry }) => {
  useDocumentTitle("Couldn't load · Tallies");

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <BrandBar />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-[13px] font-medium text-ink-3">Couldn't load</p>
        <h1 className="mt-3 max-w-lg text-[clamp(30px,4vw,44px)] font-light leading-[1.08] tracking-[-0.035em] [text-wrap:balance]">
          This bill didn't load. <span className="text-ink-4">Give it another try.</span>
        </h1>
        {message && <p className="mt-4 max-w-sm text-[15px] text-ink-2 [text-wrap:pretty]">{message}</p>}
        <button type="button" onClick={onRetry} className={`mt-8 h-12 px-5 text-[15px] ${BUTTON_PRIMARY}`}>
          Try again
        </button>
      </main>
    </div>
  );
};

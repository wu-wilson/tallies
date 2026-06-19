import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

import { Toast } from '../common/Toast';
import { VenmoWordmark } from './VenmoWordmark';

import { useShare } from '../../hooks/useShare';
import { useToast } from '../../hooks/useToast';
import { useVenmoUsername } from '../../hooks/useVenmoUsername';
import { useBillStore } from '../../store/billStore';

import { deriveAssignedTotals, formatCurrency } from '../../lib/billMath';
import { isValidVenmoUsername } from '../../lib/venmo';

import { DURATION, EASE } from '../../constants/animations';

/**
 * Share screen — the post-create confirmation. Surfaces the generated short link with Copy and native
 * Share actions, and notes the Venmo pay handoff when a handle is set. Bounces back to Result if no link
 * has been created yet (e.g. on a stray visit).
 * @returns The share confirmation layout with a transient toast
 */
export const ShareScreen: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const people = useBillStore((s) => s.people);
  const shareUrl = useBillStore((s) => s.shareUrl);
  const setScreen = useBillStore((s) => s.setScreen);
  const { copyLink, nativeShare, hasNativeShare } = useShare();
  const { toast, showToast, dismissToast } = useToast();
  const { username } = useVenmoUsername();

  const { total } = useMemo(() => deriveAssignedTotals(receipts, people), [receipts, people]);
  const hasVenmo = isValidVenmoUsername(username);

  useEffect(() => {
    if (!shareUrl) setScreen('result');
  }, [shareUrl, setScreen]);

  if (!shareUrl) return null;

  const handleCopy = async () => {
    const copied = await copyLink(shareUrl);
    showToast(copied ? 'Link copied' : "Couldn't copy — long-press the link", copied ? 'success' : 'warning');
  };

  const handleShare = async () => {
    const outcome = await nativeShare(shareUrl);
    if (outcome === 'copied') showToast('Link copied', 'success');
    else if (outcome === 'failed') showToast("Couldn't share the link — try again", 'warning');
  };

  return (
    <div className="mx-auto min-h-dvh max-w-xl px-5 pt-[calc(28px+env(safe-area-inset-top))]">
      <button
        onClick={() => setScreen('result')}
        className="mb-6 font-mono text-sm font-bold text-ink-faint transition-[filter] hover:text-ink"
      >
        &larr; Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.smooth, ease: EASE.out }}
        className="flex items-center gap-4"
      >
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center bg-brand text-2xl font-extrabold text-brand-on">
          ✓
        </span>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Your split is ready</h1>
          <div className="mt-1 font-mono text-xs text-ink-faint">
            {formatCurrency(total)} · {people.length} {people.length === 1 ? 'person' : 'people'}
          </div>
        </div>
      </motion.div>

      {hasVenmo && (
        <div className="mt-7 flex items-center gap-2.5 border border-ink bg-paper-raised px-4 py-3.5">
          <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-ink-faint">EVERYONE PAYS YOU WITH</span>
          <VenmoWordmark className="text-venmo" />
        </div>
      )}

      <p className="mt-8 font-mono text-[11px] font-bold tracking-[0.06em] text-ink-faint">YOUR SHAREABLE LINK</p>
      <div className="mt-2.5 flex border border-ink">
        <div className="flex-1 truncate bg-paper-raised px-4 py-3.5 font-mono text-[13px]">{shareUrl}</div>
        <button
          onClick={handleCopy}
          className="border-l border-ink bg-paper px-6 text-sm font-extrabold transition-[filter] hover:brightness-[0.97]"
        >
          Copy
        </button>
      </div>

      <button
        onClick={handleShare}
        className="mt-3 flex w-full items-center justify-center gap-2 bg-brand px-4 py-4 text-[15px] font-extrabold text-brand-on transition-[filter] hover:brightness-110"
      >
        <span className="text-base leading-none">↑</span>
        {hasNativeShare ? 'Share…' : 'Copy & share'}
      </button>

      <p className="mt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
        Anyone with the link sees their share{hasVenmo ? ' and pays you on Venmo' : ''} — no account needed. Shared bills
        last 30 days.
      </p>

      <Toast
        message={toast.message}
        variant={toast.variant}
        isVisible={toast.isVisible}
        showId={toast.showId}
        onDismiss={dismissToast}
      />
    </div>
  );
};

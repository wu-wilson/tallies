import React, { useEffect, useMemo } from 'react';

import { AppBar } from '../common/AppBar';
import { Avatar } from '../common/Avatar';
import { BackLink } from '../common/BackLink';
import { Icon } from '../common/Icon';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, CARD_TITLE, LINK_MUTED } from '../common/styles';
import { Toast } from '../common/Toast';

import { useShare } from '../../hooks/useShare';
import { useToast } from '../../hooks/useToast';
import { useBillStore } from '../../store/billStore';

import { deriveAssignedTotals, formatCurrency } from '../../lib/billMath';

/**
 * Share screen, after the link is created: the short link with Copy and Share, and who owes the payer what (or
 * everyone's share when nobody was marked as paying). Bounces back to Result if no link exists yet.
 * @returns The share confirmation layout
 */
export const ShareScreen: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const people = useBillStore((s) => s.people);
  const payerId = useBillStore((s) => s.payerId);
  const shareUrl = useBillStore((s) => s.shareUrl);
  const shareVenmoUsername = useBillStore((s) => s.shareVenmoUsername);
  const setScreen = useBillStore((s) => s.setScreen);
  const startNewBill = useBillStore((s) => s.startNewBill);
  const { copyLink, nativeShare, hasNativeShare } = useShare();
  const { toast, showToast, dismissToast } = useToast();

  const { breakdowns } = useMemo(() => deriveAssignedTotals(receipts, people), [receipts, people]);
  const payer = people.find((p) => p.id === payerId);
  // Someone with nothing on the bill doesn't owe the payer anything.
  const owing = payer ? breakdowns.filter((b) => b.personId !== payer.id && b.roundedTotal > 0) : breakdowns;
  const owed = owing.reduce((sum, b) => sum + b.roundedTotal, 0);
  const hasVenmo = shareVenmoUsername !== null;

  useEffect(() => {
    if (!shareUrl) setScreen('result');
  }, [shareUrl, setScreen]);

  if (!shareUrl) return null;
  const displayUrl = shareUrl.replace(/^https?:\/\//, '');
  const idStart = displayUrl.lastIndexOf('/') + 1;

  const showCopyResult = (isCopied: boolean) =>
    showToast(isCopied ? 'Link copied' : "Couldn't copy the link. Press and hold it to copy.", isCopied ? 'success' : 'warning');
  const handleCopy = async () => showCopyResult(await copyLink(shareUrl));
  // Without a share sheet (or when it fails) the link is copied instead.
  const handleShare = async () => {
    const outcome = await nativeShare(shareUrl);
    if (outcome !== 'shared') showCopyResult(outcome === 'copied');
  };

  let sentence = 'Send this link to the group. Everyone sees what they owe.';
  if (payer && hasVenmo) sentence = `Send this link to the group. Everyone sees their share and can pay ${payer.name} back on Venmo.`;
  else if (payer) sentence = `Send this link to the group. Everyone sees what they owe ${payer.name}.`;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar />
      <main className="flex-1 px-5 pb-14 pt-7">
        <div className="mx-auto max-w-[540px]">
          <BackLink label="Edit the split" onClick={() => setScreen('result')} />
          <span className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl bg-settled-wash text-settled">
            <Icon name="check" size={24} />
          </span>
          <h1 tabIndex={-1} className="mt-5 text-[clamp(26px,2.3vw,32px)] leading-tight tracking-[-0.035em] focus:outline-none">Your split is ready</h1>
          <p className="mt-2 text-[15px] text-ink-2 [text-wrap:pretty]">{sentence}</p>

          <div className={`mt-7 flex items-center gap-3 py-1.5 pl-4 pr-1.5 ${CARD}`}>
            {/* The break opportunity after "/b/" moves the ID to its own line whole on the narrowest phones. */}
            <span className="min-w-0 flex-1 text-[15px] font-medium [overflow-wrap:anywhere]">
              {displayUrl.slice(0, idStart)}
              <wbr />
              {displayUrl.slice(idStart)}
            </span>
            <button type="button" onClick={handleCopy} className={`h-10 shrink-0 px-3.5 text-sm ${BUTTON_SECONDARY}`}>
              <Icon name="copy" size={15} />
              Copy
            </button>
          </div>
          <button type="button" onClick={handleShare} className={`mt-3 h-12 w-full text-[15px] ${BUTTON_PRIMARY}`}>
            <Icon name="share" size={16} />
            {hasNativeShare ? 'Share link' : 'Copy and share'}
          </button>

          {owing.length > 0 && (
            <section aria-label={payer ? `Who owes ${payer.name}` : "Everyone's share"} className={`mt-7 overflow-hidden ${CARD}`}>
              <div className="flex items-baseline justify-between gap-3 px-[18px] pb-2.5 pt-3.5">
                <h2 className={`min-w-0 [overflow-wrap:anywhere] ${CARD_TITLE}`}>{payer ? `Who owes ${payer.name}` : "Everyone's share"}</h2>
                <span className="shrink-0 text-[13px] text-ink-3">{formatCurrency(owed)} in total</span>
              </div>
              {owing.map((b) => (
                <div key={b.personId} className="flex h-[52px] items-center gap-3 border-t border-line-soft px-[18px]">
                  <Avatar name={b.personName} color={b.personColor} />
                  <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">{b.personName}</span>
                  <span className="text-[15px] font-semibold">{formatCurrency(b.roundedTotal)}</span>
                </div>
              ))}
            </section>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13.5px]">
            <span className="text-ink-3">This link works for 30 days.</span>
            <button type="button" onClick={startNewBill} className={LINK_MUTED}>
              Start a new bill
            </button>
          </div>
        </div>
      </main>
      <Toast message={toast.message} variant={toast.variant} isVisible={toast.isVisible} showId={toast.showId} onDismiss={dismissToast} />
    </div>
  );
};

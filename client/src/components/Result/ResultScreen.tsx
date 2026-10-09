import React, { useEffect, useMemo, useRef } from 'react';

import { AppBar } from '../common/AppBar';
import { BackLink } from '../common/BackLink';
import { BUTTON_PRIMARY } from '../common/styles';
import { Toast } from '../common/Toast';
import { PersonList } from './PersonList';
import { ReceiptsSummary } from './ReceiptsSummary';
import { SettleCard } from './SettleCard';

import { useShare } from '../../hooks/useShare';
import { useToast } from '../../hooks/useToast';
import { useVenmoUsername } from '../../hooks/useVenmoUsername';
import { useBillStore } from '../../store/billStore';

import { deriveAssignedTotals, formatCurrency } from '../../lib/billMath';
import { deriveBillName } from '../../lib/billName';
import { formatReceiptDate } from '../../lib/dates';
import { isValidVenmoUsername } from '../../lib/venmo';

/**
 * Review screen: the bill's title and total, everyone's share in an expandable list, and a settle card that picks
 * who paid, takes their Venmo handle, and creates the share link (in a bottom bar on phones). A new link opens
 * the Share screen; a failure shows a toast.
 * @returns The result layout
 */
export const ResultScreen: React.FC = () => {
  const receipts = useBillStore((s) => s.receipts);
  const people = useBillStore((s) => s.people);
  const name = useBillStore((s) => s.name);
  const payerId = useBillStore((s) => s.payerId);
  const setPayerId = useBillStore((s) => s.setPayerId);
  const setScreen = useBillStore((s) => s.setScreen);
  const setShareLink = useBillStore((s) => s.setShareLink);
  const { createShareLink, isCreating } = useShare();
  const { toast, showToast, dismissToast } = useToast();
  const payer = people.find((p) => p.id === payerId);
  const { username, setUsername } = useVenmoUsername(payer?.name);

  // Going back to Verify unmounts this screen, so a link still being made for the old bill is dropped.
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const totals = useMemo(() => deriveAssignedTotals(receipts, people), [receipts, people]);
  const single = totals.receiptCount === 1 ? receipts.find((r) => r.id === totals.receiptSummaries[0].receiptId) : undefined;
  const meta = [
    single && formatReceiptDate(single.date),
    totals.receiptCount > 1 && `${totals.receiptCount} receipts`,
    `${totals.breakdowns.length} ${totals.breakdowns.length === 1 ? 'person' : 'people'}`,
    `${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`,
  ].filter(Boolean);

  const handleCreate = async () => {
    if (isCreating) return;
    const venmo = isValidVenmoUsername(username) ? username : null;
    const result = await createShareLink(venmo);
    if (!isMountedRef.current) return;
    if ('error' in result) {
      showToast(result.error, 'error');
      return;
    }
    setShareLink(result.url, venmo);
    setScreen('share');
  };

  const createButton = (
    // Stays enabled (a repeat press is ignored) so keyboard focus isn't lost while the link is made or after it fails.
    <button type="button" onClick={handleCreate} aria-disabled={isCreating} className={`h-12 w-full text-[15px] ${BUTTON_PRIMARY}`}>
      {isCreating && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {isCreating ? 'Creating the link' : 'Create share link'}
    </button>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar step="share" />
      <main className="flex-1 px-5 pb-12 pt-7">
        <div className="mx-auto max-w-[1200px]">
          <BackLink label="Assign" onClick={() => setScreen('verify')} />
          <h1 tabIndex={-1} className="mt-3 break-words text-[clamp(26px,2.3vw,32px)] leading-tight tracking-[-0.035em] focus:outline-none">{deriveBillName(name)}</h1>
          <p className="mt-1 text-sm text-ink-3">{meta.join(' · ')}</p>
          <p className="mt-[18px] text-[clamp(44px,4.6vw,64px)] font-light leading-none tracking-[-0.045em]">{formatCurrency(totals.total)}</p>

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 [grid-template-areas:'main'_'summary'_'settle'] lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_auto_1fr] lg:gap-x-8 lg:[grid-template-areas:'main_settle'_'main_summary'_'main_.']">
            <div className="min-w-0 [grid-area:main]">
              <PersonList
                breakdowns={totals.breakdowns}
                peopleCount={people.length}
                title="Per person"
                hint="Tap a name for the details"
                variant="result"
                payerId={payer?.id}
                total={totals.total}
              />
            </div>
            <div className="[grid-area:settle]">
              <SettleCard people={people} payerId={payerId} onPayerChange={setPayerId} venmoUsername={username} onVenmoChange={setUsername} isLocked={isCreating}>
                {createButton}
              </SettleCard>
            </div>
            <div className="[grid-area:summary]">
              <ReceiptsSummary summaries={totals.receiptSummaries} subtotal={totals.subtotal} tax={totals.taxAmount} tip={totals.tipAmount} />
            </div>
          </div>
        </div>
      </main>
      <div className="sticky bottom-0 z-30 border-t border-line bg-surface px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 lg:hidden">
        {createButton}
      </div>
      <Toast message={toast.message} variant={toast.variant} isVisible={toast.isVisible} showId={toast.showId} onDismiss={dismissToast} hasRail />
    </div>
  );
};

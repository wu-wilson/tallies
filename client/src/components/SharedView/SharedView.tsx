import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AppBar } from '../common/AppBar';
import { Avatar } from '../common/Avatar';
import { NotFound } from '../common/NotFound';
import { LINK_MUTED } from '../common/styles';
import { PersonList } from '../Result/PersonList';
import { ReceiptsSummary } from '../Result/ReceiptsSummary';
import { LoadError } from './LoadError';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useSharedBill } from '../../hooks/useSharedBill';
import { useBillStore } from '../../store/billStore';

import { deriveAssignedTotals, formatCurrency } from '../../lib/billMath';
import { deriveBillName, deriveMemoLabel } from '../../lib/billName';
import { formatDate, formatReceiptDate } from '../../lib/dates';
import { isValidVenmoUsername } from '../../lib/venmo';

/**
 * A shared bill as a friend sees it (`/b/:id`): who shared it, the title and total, then "Find your name", where
 * each person's row opens their items and, for anyone who owes the payer, a button that pays their share on Venmo.
 * Missing or expired links show the not-found screen; other failures offer a retry.
 * @returns Loading state, the not-found or load-error screen, or the shared bill
 */
export const SharedView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { bill, isLoading, isNotFound, error, retry } = useSharedBill(id || '');
  useDocumentTitle(bill ? `${deriveBillName(bill.name)} · Tallies` : undefined);
  const startNewBill = useBillStore((s) => s.startNewBill);

  const totals = useMemo(() => (bill ? deriveAssignedTotals(bill.receipts, bill.people) : null), [bill]);

  // Try again gives way to the loading view, which drops focus to the page. Once the retry settles, focus the heading
  // that replaced it (the bill, not-found, or the error again), so a screen reader says how it went.
  const isRetryingRef = useRef(false);
  useEffect(() => {
    if (isLoading || !isRetryingRef.current) return;
    isRetryingRef.current = false;
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
  }, [isLoading]);
  const handleRetry = () => {
    isRetryingRef.current = true;
    retry();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-ink" />
        <p role="status" className="text-[13.5px] text-ink-3">Loading the bill</p>
      </div>
    );
  }

  if (isNotFound) return <NotFound />;

  if (error || !bill || !totals) return <LoadError message={error} onRetry={handleRetry} />;

  const payer = bill.people.find((p) => p.id === bill.payerId);
  const venmoUsername = bill.venmoUsername && isValidVenmoUsername(bill.venmoUsername) ? bill.venmoUsername : undefined;
  const single = totals.receiptCount === 1 ? bill.receipts.find((r) => r.id === totals.receiptSummaries[0].receiptId) : undefined;
  const meta = [
    single && formatReceiptDate(single.date),
    totals.receiptCount > 1 && `${totals.receiptCount} receipts`,
    `${totals.breakdowns.length} ${totals.breakdowns.length === 1 ? 'person' : 'people'}`,
  ].filter(Boolean);
  const expires = bill.expiresAt ? new Date(bill.expiresAt) : null;
  let hint = 'Tap it to see your items.';
  if (venmoUsername) hint = payer ? `Tap it to see your items and pay ${payer.name} back.` : 'Tap it to see your items and pay your share.';

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar
        action={
          <Link
            to="/"
            onClick={startNewBill}
            className={`relative text-[13.5px] before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] ${LINK_MUTED}`}
          >
            Split your own bill
          </Link>
        }
      />
      <main className="flex-1 px-5 pb-14 pt-8">
        <div className="mx-auto max-w-[1200px]">
          <p className="flex items-center gap-2 text-[13.5px] text-ink-2">
            {payer && <Avatar name={payer.name} color={payer.color} size="sm" />}
            <span className="min-w-0 [overflow-wrap:anywhere]">{payer ? `${payer.name} shared this bill with you` : 'Shared with you'}</span>
          </p>
          <h1 tabIndex={-1} className="mt-3.5 break-words text-[clamp(26px,2.3vw,32px)] leading-tight tracking-[-0.035em] focus:outline-none">{deriveBillName(bill.name)}</h1>
          <p className="mt-1 text-sm text-ink-3">{meta.join(' · ')}</p>
          <p className="mt-[18px] text-[clamp(44px,4.6vw,64px)] font-light leading-none tracking-[-0.045em]">{formatCurrency(totals.total)}</p>

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-8">
            <PersonList
              breakdowns={totals.breakdowns}
              peopleCount={bill.people.length}
              title="Find your name"
              hint={hint}
              variant="shared"
              payerId={payer?.id}
              payerName={payer?.name}
              venmoUsername={venmoUsername}
              venmoMemo={`${deriveMemoLabel(bill.name, bill.receipts)} · split via tallies.dev`}
            />
            <div className="flex flex-col gap-3.5">
              <ReceiptsSummary summaries={totals.receiptSummaries} subtotal={totals.subtotal} tax={totals.taxAmount} tip={totals.tipAmount} />
              {expires && !Number.isNaN(expires.getTime()) && (
                <p className="mx-0.5 text-[13px] text-ink-3">This link expires on {formatDate(expires)}.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

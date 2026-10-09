import React from 'react';

import { CARD } from '../common/styles';
import { PayerSelect } from './PayerSelect';
import { VenmoField } from './VenmoField';

import type { Person } from '../../types/bill';

interface SettleCardProps {
  people: Person[];
  payerId: string | null;
  onPayerChange: (personId: string | null) => void;
  venmoUsername: string;
  onVenmoChange: (raw: string) => void;
  /** True while the link is being made, so the payer and handle can't change under it. */
  isLocked: boolean;
  /** The create-link button, shown on `lg+` (phones carry it in the bottom bar). */
  children: React.ReactNode;
}

/**
 * How the bill gets settled: who paid, their optional Venmo handle, and the button that creates the share link.
 * @param props - People, the payer, the Venmo handle, their handlers, the lock, and the call to action
 * @returns The settle card
 */
export const SettleCard: React.FC<SettleCardProps> = ({ people, payerId, onPayerChange, venmoUsername, onVenmoChange, isLocked, children }) => {
  const payer = people.find((p) => p.id === payerId);

  return (
    <section aria-label="Settle up" className={`p-[18px] ${CARD}`}>
      <fieldset disabled={isLocked} className="min-w-0">
        <PayerSelect people={people} value={payerId} onChange={onPayerChange} />
        <div className="mt-5">
          <VenmoField ownerName={payer?.name} value={venmoUsername} onChange={onVenmoChange} />
        </div>
      </fieldset>
      <div className="mt-[18px] hidden lg:block">
        {children}
        <p className="mt-2.5 text-center text-[12.5px] text-ink-3">Links last 30 days. No account needed to open one.</p>
      </div>
    </section>
  );
};

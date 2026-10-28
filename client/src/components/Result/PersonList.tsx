import React from 'react';

import { CARD, CARD_TITLE } from '../common/styles';
import { PersonRow } from './PersonRow';

import { formatCurrency } from '../../lib/billMath';

import type { PersonBreakdown } from '../../lib/billMath';

interface PersonListProps {
  breakdowns: PersonBreakdown[];
  /** Everyone on the bill, for "with everyone" notes. */
  peopleCount: number;
  title: string;
  /** One line beside the title, wrapping under it when space runs out. */
  hint: string;
  variant: 'result' | 'shared';
  payerId?: string;
  payerName?: string;
  venmoUsername?: string;
  venmoMemo?: string;
  /** When set, a footer shows that the shares add up to this total (the owner's view). */
  total?: number;
}

/**
 * The per-person card shared by Result and the shared view: a titled list of expandable rows, one per person,
 * and on Result a footer confirming the shares add up to the bill.
 * @param props - Breakdowns, the head count, the heading, the variant, and the payer details
 * @returns The card
 */
export const PersonList: React.FC<PersonListProps> = ({ breakdowns, peopleCount, title, hint, variant, payerId, payerName, venmoUsername, venmoMemo, total }) => (
  <section aria-label={title} className={`overflow-hidden ${CARD}`}>
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 px-[18px] pb-2.5 pt-4">
      <h2 className={CARD_TITLE}>{title}</h2>
      <p className="min-w-0 text-[13px] text-ink-3 [overflow-wrap:anywhere]">{hint}</p>
    </div>
    {breakdowns.map((breakdown) => (
      <PersonRow
        key={breakdown.personId}
        breakdown={breakdown}
        peopleCount={peopleCount}
        isPayer={breakdown.personId === payerId}
        variant={variant}
        payerName={payerName}
        venmoUsername={venmoUsername}
        venmoMemo={venmoMemo}
      />
    ))}
    {total !== undefined && (
      <div className="flex items-baseline justify-between gap-4 border-t border-line bg-ground py-3.5 pl-[18px] pr-[calc(16px+1.75rem)]">
        <span className="text-[13.5px] text-ink-3">Shares add up to the bill</span>
        <span className="text-[15px] font-semibold">{formatCurrency(total)}</span>
      </div>
    )}
  </section>
);

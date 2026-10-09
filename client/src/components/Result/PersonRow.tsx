import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';
import { PersonGroup } from './PersonGroup';
import { VenmoButton } from './VenmoButton';

import { formatCurrency } from '../../lib/billMath';

import { DURATION, EASE } from '../../constants/animations';

import type { PersonBreakdown } from '../../lib/billMath';

interface PersonRowProps {
  breakdown: PersonBreakdown;
  /** Everyone on the bill, for "with everyone" notes. */
  peopleCount: number;
  /** True for the person who paid the bill. */
  isPayer: boolean;
  /** `shared` is a friend's view: the payer's row reads "Paid the bill" and anyone who owes them gets a pay button. */
  variant: 'result' | 'shared';
  /** Payer's name for the pay button; omit when nobody was chosen. */
  payerName?: string;
  /** The payer's Venmo handle; without it there is no pay button. */
  venmoUsername?: string;
  /** Note prefilled on the Venmo payment screen. */
  venmoMemo?: string;
}

/**
 * One person in the per-person list: avatar, name, a caption, and their share. Tapping expands their items by
 * receipt and, in the shared view, a button that pays the payer exactly that share.
 * @param props - The person's breakdown, the bill's head count, the payer details, and the variant
 * @returns The expandable row
 */
export const PersonRow: React.FC<PersonRowProps> = ({ breakdown, peopleCount, isPayer, variant, payerName, venmoUsername, venmoMemo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemCount = breakdown.groups.reduce((n, g) => n + g.items.length, 0);
  const items = itemCount === 0 ? 'No items' : `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
  const shouldShowPay = variant === 'shared' && !isPayer && !!venmoUsername && breakdown.roundedTotal > 0;

  let caption = <span className="text-ink-3">{isPayer ? `${items} · paid the bill` : items}</span>;
  if (variant === 'shared' && isPayer) caption = <span className="text-settled">Paid the bill</span>;

  return (
    <div className="border-t border-line-soft">
      <button
        type="button"
        onClick={() => setIsExpanded((e) => !e)}
        aria-expanded={isExpanded}
        className={`flex min-h-[62px] w-full items-center gap-3 py-2.5 pl-[18px] pr-4 text-left transition-colors duration-200 focus-visible:outline-offset-[-2px] ${isExpanded ? 'bg-ground' : 'hover:bg-ground'}`}
      >
        <Avatar name={breakdown.personName} color={breakdown.personColor} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium">{breakdown.personName}</span>
          <span className="block text-[13px]">{caption}</span>
        </span>
        <span className={`text-base font-semibold ${variant === 'shared' && isPayer ? 'text-ink-3' : ''}`}>
          {formatCurrency(breakdown.roundedTotal)}
        </span>
        <Icon name="chevron-right" size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-ink-3' : 'text-ink-5'}`} />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE.out }}
            className="overflow-hidden bg-ground"
          >
            <div className="flex flex-col gap-4 pb-[18px] pl-[18px] pr-4 pt-1 sm:pl-[62px] sm:pr-11">
              {breakdown.groups.map((group) => (
                <PersonGroup key={group.receiptId} group={group} peopleCount={peopleCount} />
              ))}
              {itemCount === 0 && <p className="text-[13px] text-ink-3">Nothing assigned on this bill.</p>}
              {shouldShowPay && (
                <div>
                  <VenmoButton username={venmoUsername} payeeName={payerName} amount={breakdown.roundedTotal} memo={venmoMemo ?? ''} />
                  <p className="mt-2 text-center text-[12.5px] text-ink-3">Opens Venmo with the amount filled in.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

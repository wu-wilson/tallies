import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { AddItemButton } from './AddItemButton';
import { ItemCard } from './ItemCard';
import { PeopleBar } from './PeopleBar';
import { PrimaryCta } from './PrimaryCta';
import { SplitEvenlyButton } from './SplitEvenlyButton';
import { StickyAction } from './StickyAction';
import { SummaryPanel } from './SummaryPanel';
import { TaxTipRow } from './TaxTipRow';

import { useBillStore } from '../../store/billStore';

import { DURATION, EASE } from '../../constants/animations';
import { MAX_NAME_LENGTH } from '../../constants/config';

/**
 * Edit-and-assign screen — header, people bar, item list, tax/tip, summary, and primary CTA (sticky on mobile, inline at the end of the column on `lg+`).
 * @returns The full verify layout
 */
export const VerifyScreen: React.FC = () => {
  const {
    merchant,
    date,
    items,
    tax,
    taxIsPercent,
    tip,
    tipIsPercent,
    setMerchant,
    setDate,
    setTax,
    setTaxIsPercent,
    setTip,
    setTipIsPercent,
    setScreen,
  } = useBillStore();

  const [isEditingMerchant, setIsEditingMerchant] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [merchantValue, setMerchantValue] = useState(merchant);
  const [dateValue, setDateValue] = useState(date);

  const handleMerchantBlur = () => {
    setIsEditingMerchant(false);
    setMerchant(merchantValue.trim());
  };

  const handleDateBlur = () => {
    setIsEditingDate(false);
    setDate(dateValue.trim());
  };

  return (
    <motion.div
      className="mx-auto min-h-dvh max-w-2xl px-6 pt-[calc(32px+env(safe-area-inset-top))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
    >
      {/* Back */}
      <button
        onClick={() => setScreen('capture')}
        className="-ml-1 mb-6 flex items-center gap-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="mb-10">
        {isEditingMerchant ? (
          <input
            type="text"
            value={merchantValue}
            onChange={(e) => setMerchantValue(e.target.value)}
            onBlur={handleMerchantBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleMerchantBlur()}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Restaurant name"
            className="-mx-2 w-[calc(100%+1rem)] rounded bg-transparent px-2 text-2xl font-semibold tracking-tight text-text-primary outline-none placeholder:text-text-tertiary"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setMerchantValue(merchant);
              setIsEditingMerchant(true);
            }}
            className="-mx-2 rounded px-2 text-left text-2xl font-semibold tracking-tight text-text-primary transition-colors hover:text-brand"
          >
            {merchant || <span className="text-text-tertiary">Untitled bill</span>}
          </button>
        )}

        <div className="mt-1 text-xs text-text-secondary">
          {isEditingDate ? (
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              onBlur={handleDateBlur}
              className="-mx-2 rounded bg-transparent px-2 text-text-secondary outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setDateValue(date);
                setIsEditingDate(true);
              }}
              className="-mx-2 rounded px-2 transition-colors hover:text-text-primary"
            >
              {date || 'Add date'}
            </button>
          )}
        </div>
      </div>

      {/* People */}
      <div className="mb-10">
        <PeopleBar />
      </div>

      {/* Items */}
      <section className="mb-10">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
            Items
          </span>
          <SplitEvenlyButton />
        </div>

        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <ItemCard key={item.id} item={item} index={index} />
            ))}
          </AnimatePresence>
          <AddItemButton />
        </div>
      </section>

      {/* Adjustments */}
      <section className="mb-10">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
          Adjustments
        </p>
        <div className="rounded-xl border border-border bg-bg-secondary px-4">
          <div className="divide-y divide-border-subtle">
            <TaxTipRow
              label="Tax"
              value={tax}
              isPercent={taxIsPercent}
              onValueChange={setTax}
              onTogglePercent={setTaxIsPercent}
            />
            <TaxTipRow
              label="Tip"
              value={tip}
              isPercent={tipIsPercent}
              onValueChange={setTip}
              onTogglePercent={setTipIsPercent}
              quickButtons={[15, 18, 20, 22]}
            />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="mb-10">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
          Summary
        </p>
        <SummaryPanel />
      </section>

      {/* Inline CTA on desktop. Mobile uses StickyAction below. */}
      <div className="hidden pb-8 lg:block">
        <PrimaryCta />
      </div>

      {/* Mobile-only sticky-bottom CTA */}
      <StickyAction />
    </motion.div>
  );
};

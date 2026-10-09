import React from 'react';

import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';

import type { Person } from '../../types/bill';

interface PayerSelectProps {
  people: Person[];
  /** The chosen payer's ID, or null for nobody yet. */
  value: string | null;
  onChange: (personId: string | null) => void;
}

/**
 * "Who paid?": a native select over the bill's people, showing the chosen person's avatar beside it. Everyone else
 * then owes that person.
 * @param props - The people, the chosen ID, and the change handler
 * @returns The labelled select
 */
export const PayerSelect: React.FC<PayerSelectProps> = ({ people, value, onChange }) => {
  const payer = people.find((p) => p.id === value);

  return (
    <div>
      <label htmlFor="payer" className="text-sm font-medium">
        Who paid?
      </label>
      <p className="text-[13px] text-ink-3">Everyone else pays them back.</p>
      <div className="field relative mt-3 flex h-[46px] items-center">
        {payer && (
          <span className="pointer-events-none absolute left-3">
            <Avatar name={payer.name} color={payer.color} size="sm" />
          </span>
        )}
        <select
          id="payer"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className={`h-full w-full cursor-pointer appearance-none disabled:cursor-not-allowed rounded-lg bg-transparent pr-9 text-[14.5px] ${payer ? 'pl-10' : 'pl-3 text-ink-3'}`}
        >
          <option value="">Choose a person</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 text-ink-3" />
      </div>
    </div>
  );
};

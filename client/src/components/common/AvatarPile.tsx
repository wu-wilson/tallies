import React from 'react';

import { Avatar } from './Avatar';

import type { Person } from '../../types/bill';

/** Most avatars a pile draws. */
const MAX_SHOWN = 4;

interface AvatarPileProps {
  people: Person[];
}

/**
 * Overlapping row of up to four avatars, each ringed in white so the overlap reads cleanly.
 * @param props - The people to show, in order (only the first four are drawn)
 * @returns The pile, or nothing when `people` is empty
 */
export const AvatarPile: React.FC<AvatarPileProps> = ({ people }) => {
  if (people.length === 0) return null;
  return (
    <span className="flex">
      {people.slice(0, MAX_SHOWN).map((person, i) => (
        <span key={person.id} className={`rounded-full ring-[1.5px] ring-surface ${i > 0 ? '-ml-1.5' : ''}`}>
          <Avatar name={person.name} color={person.color} size="sm" />
        </span>
      ))}
    </span>
  );
};

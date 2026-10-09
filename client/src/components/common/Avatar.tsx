import React from 'react';

import type { PersonColorKey } from '../../constants/colors';

const SIZES = {
  sm: 'h-5 w-5 text-[9.5px]',
  md: 'h-7 w-7 text-xs',
  lg: 'h-8 w-8 text-[13px]',
} as const;

interface AvatarProps {
  /** Display name; its first character, uppercased, becomes the initial. */
  name: string;
  color: PersonColorKey;
  /** sm=20px (piles in item rows), md=28px (people lists), lg=32px (per-person rows). Defaults to `md`. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Solid circle in the person's colour with a white initial. Hidden from assistive tech, since a name always sits
 * beside it or in its control's label.
 * @param props - Name, colour key, and size
 * @returns The avatar
 */
export const Avatar: React.FC<AvatarProps> = ({ name, color, size = 'md' }) => (
  <span
    aria-hidden="true"
    title={name}
    className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${SIZES[size]}`}
    style={{ backgroundColor: `rgb(var(--person-${color}))` }}
  >
    {Array.from(name.trim())[0]?.toUpperCase() ?? '?'}
  </span>
);

import React from 'react';
import clsx from 'clsx';

import type { PersonColorKey } from '../../constants/colors';

interface AvatarProps {
  /** Display name; the first character (uppercased) becomes the avatar's initial. */
  name: string;
  color: PersonColorKey;
  /** Tier — sm=26px (item rows), md=34px (people rows). Defaults to `md`. */
  size?: 'sm' | 'md';
  /** When provided, the avatar becomes a clickable button; when omitted, renders as a decorative span. */
  onClick?: () => void;
}

const SIZES = {
  sm: 'h-[26px] w-[26px] text-[11px]',
  md: 'h-[34px] w-[34px] text-[13px]',
} as const;

/**
 * Circular person avatar — a 1.5px ink ring around the person's assigned color, with the name's initial.
 * @param props - Avatar configuration
 * @returns Circular button when `onClick` is set, otherwise a decorative span
 */
export const Avatar: React.FC<AvatarProps> = ({ name, color, size = 'md', onClick }) => {
  const initial = (name || '?').charAt(0).toUpperCase();
  const className = clsx(
    'flex shrink-0 items-center justify-center rounded-full border border-ink font-extrabold text-brand-on',
    SIZES[size],
  );
  const style = { backgroundColor: `var(--person-${color})` };

  // Decorative avatars render as a span so they can sit inside other buttons (e.g. the assign sheet rows).
  if (!onClick) {
    return (
      <span className={className} style={style} title={name}>
        {initial}
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} style={style} title={name}>
      {initial}
    </button>
  );
};

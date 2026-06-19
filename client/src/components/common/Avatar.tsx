import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import type { PersonColorKey } from '../../constants/colors';

interface AvatarProps {
  /** Display name; the first character (uppercased) becomes the avatar's initial. */
  name: string;
  color: PersonColorKey;
  /** Tier — xs=22px, sm=26px, md=34px, lg=40px. Defaults to `md`. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Render at reduced opacity to indicate "not assigned to this item". */
  isDimmed?: boolean;
  /** When provided, the avatar becomes a clickable button; when omitted, renders as a disabled button (purely decorative). */
  onClick?: () => void;
}

const SIZES = {
  xs: 'h-[22px] w-[22px] text-[10px]',
  sm: 'h-[26px] w-[26px] text-[11px]',
  md: 'h-[34px] w-[34px] text-[13px]',
  lg: 'h-10 w-10 text-sm',
} as const;

/**
 * Circular person avatar — a 1.5px ink ring around the person's assigned color, with the name's initial.
 * @param props - Avatar configuration
 * @returns Circular button (clickable when `onClick` is set, disabled otherwise)
 */
export const Avatar: React.FC<AvatarProps> = ({ name, color, size = 'md', isDimmed = false, onClick }) => {
  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      whileTap={onClick ? { scale: 0.88 } : undefined}
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full border border-ink font-extrabold text-brand-on transition-opacity',
        SIZES[size],
        isDimmed && 'opacity-30',
        !onClick && 'cursor-default',
      )}
      style={{ backgroundColor: `var(--person-${color})` }}
      title={name}
    >
      {initial}
    </motion.button>
  );
};

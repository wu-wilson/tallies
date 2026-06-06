import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import type { PersonColorKey } from '../../constants/colors';

interface AvatarProps {
  /** Display name; the first character (uppercased) becomes the avatar's initial. */
  name: string;
  color: PersonColorKey;
  /** Tier — xs=20px, sm=24px, md=32px. Defaults to `md`. */
  size?: 'xs' | 'sm' | 'md';
  /** Render at 25% opacity to indicate "not assigned to this item". */
  isDimmed?: boolean;
  /** When provided, the avatar becomes a clickable button; when omitted, renders as a disabled button (purely decorative). */
  onClick?: () => void;
}

const SIZES = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
} as const;

/**
 * Circular person avatar showing the name's initial in the person's assigned color.
 * @param props - Avatar configuration
 * @returns Circular button (clickable when `onClick` is set, disabled otherwise)
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  color,
  size = 'md',
  isDimmed = false,
  onClick,
}) => {
  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      whileTap={onClick ? { scale: 0.88 } : undefined}
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-bg-primary transition-opacity',
        SIZES[size],
        isDimmed && 'opacity-25',
        !onClick && 'cursor-default',
      )}
      style={{ backgroundColor: `var(--person-${color})` }}
      title={name}
    >
      {initial}
    </motion.button>
  );
};

import React from 'react';

import { Icon } from './Icon';
import { LINK_MUTED } from './styles';

interface BackLinkProps {
  /** Where it goes, such as "Receipts" or "Home". */
  label: string;
  onClick: () => void;
}

/**
 * Small "← label" link above a screen's title that returns to the screen the user came from.
 * @param props - The destination's label and the handler that goes there
 * @returns The back link
 */
export const BackLink: React.FC<BackLinkProps> = ({ label, onClick }) => (
  <button type="button" onClick={onClick} className={`relative inline-flex items-center gap-1.5 text-[13.5px] before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] ${LINK_MUTED}`}>
    <Icon name="arrow-left" size={14} />
    {label}
  </button>
);

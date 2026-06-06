import React from 'react';
import { motion } from 'framer-motion';

interface ShareCtaProps {
  onShare: () => void;
  /** True while the POST is in flight; disables the button and swaps to the "Sharing" label. */
  isSharing: boolean;
  /** True for 3 s after a successful share; swaps to the "Link copied" label. */
  hasShared: boolean;
}

/**
 * Result-screen share button — labels itself "Share with group" / "Sharing" / "Link copied" by state.
 * @param props - Share button configuration
 * @returns Full-width brand button
 */
export const ShareCta: React.FC<ShareCtaProps> = ({ onShare, isSharing, hasShared }) => {
  return (
    <motion.button
      onClick={onShare}
      disabled={isSharing}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-[13px] font-medium text-white transition-[filter,background-color] hover:bg-brand-light disabled:opacity-70"
      whileTap={{ scale: 0.98 }}
    >
      {isSharing ? (
        <>
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Sharing
        </>
      ) : hasShared ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Link copied
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share with group
        </>
      )}
    </motion.button>
  );
};

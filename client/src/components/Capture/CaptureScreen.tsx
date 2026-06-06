import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { TallyLogo, TALLY_DRAW_DURATION } from '../common/TallyLogo';
import { ImagePreview } from './ImagePreview';

import { useBillStore } from '../../store/billStore';

/** When the content reveal begins (after logo finishes drawing), in ms. */
const REVEAL_DELAY_MS = Math.round(TALLY_DRAW_DURATION * 1000) + 50;
const revealStyle: React.CSSProperties = {
  animationDelay: `${REVEAL_DELAY_MS}ms`,
};

// Module-level gate: true once the landing entrance has played in this page lifetime.
let hasPlayedEntrance = false;

function markLandingEntrancePlayed(): void {
  hasPlayedEntrance = true;
}

/**
 * Landing screen — tally logo with Add receipt / Enter manually CTAs.
 * Renders `ImagePreview` instead once the user has picked a file (preview-and-scan sub-state).
 * @returns Landing layout or the image-preview sub-screen
 */
export const CaptureScreen: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setScreen = useBillStore((s) => s.setScreen);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Recomputed on every render so paints after the first one (Change, Back,
  // navigation back to landing) skip the animation classes entirely.
  const shouldAnimate = !hasPlayedEntrance;

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    markLandingEntrancePlayed();
    setCapturedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleReplace = () => {
    setCapturedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualEntry = () => {
    markLandingEntrancePlayed();
    setScreen('verify');
  };

  if (previewUrl && capturedFile) {
    return <ImagePreview file={capturedFile} previewUrl={previewUrl} onReplace={handleReplace} />;
  }

  const revealClass = (suffix: 'left' | 'bottom') =>
    shouldAnimate ? `animate-landing-from-${suffix}` : '';

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-[280px] flex-col items-center text-center">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-2.5">
          <TallyLogo size={28} className="text-brand" animate={shouldAnimate} />
          <span
            className={`text-2xl font-semibold tracking-tight text-text-primary ${revealClass('left')}`}
            style={revealStyle}
          >
            Tallies
          </span>
        </div>

        {/* Tagline */}
        <p
          className={`mt-6 text-sm font-medium tracking-tight text-text-secondary sm:text-base ${revealClass('bottom')}`}
          style={revealStyle}
        >
          Keep tallies on every tab.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <motion.button
          onClick={() => fileInputRef.current?.click()}
          className={`mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-medium text-white transition-[filter,background-color] hover:bg-brand-light ${revealClass('bottom')}`}
          style={revealStyle}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3v18l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5V3z" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="13" y2="13" />
          </svg>
          Add receipt
        </motion.button>

        <div
          className={`mt-6 flex w-full items-center gap-3 ${revealClass('bottom')}`}
          style={revealStyle}
        >
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <motion.button
          onClick={handleManualEntry}
          className={`mt-6 rounded px-1.5 py-0.5 text-xs text-text-tertiary transition-colors duration-150 ease-out hover:bg-brand-subtle hover:text-brand ${revealClass('bottom')}`}
          style={revealStyle}
          whileTap={{ scale: 0.97 }}
        >
          Enter manually
        </motion.button>
      </div>
    </div>
  );
};

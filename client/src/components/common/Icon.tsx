import React from 'react';

/** Names of the stroked glyphs this app draws. */
export type IconName =
  | 'plus'
  | 'cross'
  | 'check'
  | 'arrow-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'trash'
  | 'upload'
  | 'copy'
  | 'share'
  | 'receipt'
  | 'alert';

/** Stroke paths on a 24-unit grid, with the stroke weight each glyph is drawn at. */
const GLYPHS: Record<IconName, { strokeWidth: number; paths: React.ReactNode }> = {
  plus: { strokeWidth: 2, paths: <path d="M12 5v14M5 12h14" /> },
  cross: { strokeWidth: 2.2, paths: <path d="M6 6l12 12M18 6 6 18" /> },
  check: { strokeWidth: 2.4, paths: <path d="m5 12.5 4.5 4.5L19 7.5" /> },
  'arrow-left': { strokeWidth: 2, paths: <path d="M19 12H5M11 6l-6 6 6 6" /> },
  'chevron-right': { strokeWidth: 2, paths: <path d="m9 6 6 6-6 6" /> },
  'chevron-down': { strokeWidth: 2, paths: <path d="m7 10 5 5 5-5" /> },
  trash: {
    strokeWidth: 1.8,
    paths: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />,
  },
  upload: {
    strokeWidth: 1.8,
    paths: <path d="M12 16V4M7 9l5-5 5 5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />,
  },
  copy: {
    strokeWidth: 2,
    paths: (
      <>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V6a2 2 0 0 1 2-2h8" />
      </>
    ),
  },
  share: {
    strokeWidth: 2,
    paths: <path d="M12 15V3M7 8l5-5 5 5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />,
  },
  receipt: {
    strokeWidth: 1.8,
    paths: <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21zM9 8h6M9 12h6" />,
  },
  alert: {
    strokeWidth: 2,
    paths: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5h.01" />
      </>
    ),
  },
};

interface IconProps {
  name: IconName;
  /** Rendered width and height in px. Defaults to 16. */
  size?: number;
  className?: string;
}

/**
 * Stroked UI glyph, drawn as SVG so it centres in its box regardless of the label font's baseline. Inherits
 * `currentColor` and is hidden from assistive tech, so pair it with a visible or `aria-label`led control.
 * @param props - Which glyph to draw, its pixel size, and optional classes
 * @returns Decorative inline SVG
 */
export const Icon: React.FC<IconProps> = ({ name, size = 16, className }) => {
  const { strokeWidth, paths } = GLYPHS[name];
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `shrink-0 ${className}` : 'shrink-0'}
    >
      {paths}
    </svg>
  );
};

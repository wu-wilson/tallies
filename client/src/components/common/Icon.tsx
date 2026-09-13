import React from 'react';

interface IconProps {
  name: 'plus' | 'cross' | 'check' | 'trash';
  /** Rendered width and height in px. Defaults to 13. */
  size?: number;
}

/** Stroke paths on a 24-unit grid, with the stroke weight each glyph is drawn at. */
const GLYPHS: Record<IconProps['name'], { strokeWidth: number; paths: React.ReactNode }> = {
  plus: {
    strokeWidth: 3,
    paths: (
      <>
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="4" y1="12" x2="20" y2="12" />
      </>
    ),
  },
  cross: {
    strokeWidth: 3,
    paths: (
      <>
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </>
    ),
  },
  check: { strokeWidth: 3, paths: <polyline points="20 6 9 17 4 12" /> },
  trash: {
    strokeWidth: 2,
    paths: (
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </>
    ),
  },
};

/**
 * Stroked UI glyph used by add, remove, and check controls. Drawn as an SVG rather than a text character so it
 * centers in its box regardless of the label font's baseline; inherits `currentColor`.
 * @param props - Which glyph to draw and its pixel size
 * @returns Decorative inline SVG
 */
export const Icon: React.FC<IconProps> = ({ name, size = 13 }) => {
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
      className="shrink-0"
    >
      {paths}
    </svg>
  );
};

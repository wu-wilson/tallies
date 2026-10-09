import React from 'react';

/** Gradient stops as token names, so the art follows the palette in `index.css`. */
const BARS = ['--art-deep', '--art-mid', '--art-light', '--art-pale'] as const;
const SLASH = ['--art-amber', '--art-coral', '--art-rose'] as const;
const BAR_PATHS = 'M170 70V570M310 70V570M450 70V570M590 70V570';
const SLASH_PATH = 'M660 150 70 520';

interface HeroArtProps {
  /** Places and sizes the SVG; below `lg` its box should keep the 720:640 ratio so nothing is cropped. */
  className?: string;
}

/**
 * The landing hero's decorative art: the Tallies mark drawn huge, four green bars under one continuous gradient and
 * a coral slash, with a fine thread texture and a soft glow.
 * @param props - Placement classes
 * @returns The art as an inline SVG
 */
export const HeroArt: React.FC<HeroArtProps> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 720 640" preserveAspectRatio="xMidYMid slice" className={className} overflow="visible">
    <defs>
      <linearGradient id="hero-bars" gradientUnits="userSpaceOnUse" x1="120" y1="40" x2="660" y2="640">
        {BARS.map((token, i) => (
          <stop key={token} offset={[0, 0.38, 0.7, 1][i]} style={{ stopColor: `rgb(var(${token}))` }} />
        ))}
      </linearGradient>
      <linearGradient id="hero-slash" gradientUnits="userSpaceOnUse" x1="660" y1="150" x2="70" y2="520">
        {SLASH.map((token, i) => (
          <stop key={token} offset={[0, 0.45, 1][i]} style={{ stopColor: `rgb(var(${token}))` }} />
        ))}
      </linearGradient>
      <filter id="hero-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="28" />
      </filter>
      <pattern id="hero-threads-v" width="4" height="10" patternUnits="userSpaceOnUse">
        <path d="M2 0V10" stroke="white" strokeOpacity="0.11" />
      </pattern>
      <pattern id="hero-threads-d" width="10" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
        <path d="M0 2H10" stroke="white" strokeOpacity="0.13" />
      </pattern>
    </defs>
    <g opacity="0.45" filter="url(#hero-glow)" strokeWidth="78" strokeLinecap="round">
      <path d={BAR_PATHS} stroke="url(#hero-bars)" />
      <path d={SLASH_PATH} stroke="url(#hero-slash)" />
    </g>
    <g strokeWidth="78" strokeLinecap="round">
      <path d={BAR_PATHS} stroke="url(#hero-bars)" />
      <path d={BAR_PATHS} stroke="url(#hero-threads-v)" />
      <path d={SLASH_PATH} stroke="url(#hero-slash)" opacity="0.96" />
      <path d={SLASH_PATH} stroke="url(#hero-threads-d)" />
    </g>
  </svg>
);

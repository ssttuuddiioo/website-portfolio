'use client'

import { INK } from './landing-theme'

/**
 * Infinite, edge-to-edge client-logo marquee for the /about page. The row of
 * logos is rendered twice back-to-back and translated by -50%, so the loop is
 * seamless. Entries with a `src` render a monochrome brand mark; the rest fall
 * back to a styled wordmark so the strip is always complete. Pauses on hover
 * and freezes entirely under prefers-reduced-motion.
 */
type Logo = { name: string; src?: string; height?: number }

const LOGOS: Logo[] = [
  { name: 'New Museum' },
  { name: 'Intel', src: '/logos/agency/intel.svg', height: 22 },
  { name: 'Dolby', src: '/logos/agency/dolby.svg', height: 20 },
  { name: 'HBO', src: '/logos/agency/hbo.svg', height: 24 },
  { name: 'Netflix', src: '/logos/agency/netflix.svg', height: 18 },
  { name: 'Google' },
  { name: 'Hypebeast', src: '/logos/agency/Hypebeast-Logo.png', height: 16 },
  { name: 'Hope Hydration', src: '/logos/agency/hope.png', height: 28 },
  { name: 'Civic', src: '/logos/agency/civic.webp', height: 22 },
  { name: 'Sony' },
  { name: 'Invisible North', src: '/logos/agency/invisiblenorth.png', height: 24 },
  { name: 'Cox' },
  { name: 'Mercedes-Benz' },
  { name: 'Michigan Central' },
]

function LogoItem({ logo }: { logo: Logo }) {
  if (logo.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo.src}
        alt={logo.name}
        style={{
          height: logo.height ?? 22,
          width: 'auto',
          opacity: 0.6,
          // The marks are black-on-transparent, so they would disappear against
          // the near-black ground; invert paints them light. grayscale-then-invert
          // (rather than brightness(0) invert(1)) keeps hope.png and
          // invisiblenorth.png — which are opaque plates, not cutouts — from
          // flipping into solid white rectangles.
          filter: 'grayscale(1) invert(1)',
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <span
      className="font-display"
      style={{
        fontWeight: 700,
        fontSize: 'clamp(1rem, 1.7vw, 1.35rem)',
        letterSpacing: '0.01em',
        color: INK,
        opacity: 0.45,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {logo.name}
    </span>
  )
}

export function LogoMarquee() {
  return (
    <div
      aria-label="Selected clients and partners"
      style={{
        width: '100%',
        overflow: 'hidden',
        // Soft fade at both edges so logos dissolve in/out rather than clip.
        maskImage:
          'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
      }}
    >
      <div className="logo-marquee__track">
        {[0, 1].map((dup) => (
          <div key={dup} aria-hidden={dup === 1} className="logo-marquee__group">
            {LOGOS.map((logo) => (
              <LogoItem key={`${dup}-${logo.name}`} logo={logo} />
            ))}
          </div>
        ))}
      </div>
      <style>{`
        .logo-marquee__track {
          display: flex;
          width: max-content;
          animation: logo-marquee 42s linear infinite;
        }
        .logo-marquee__track:hover {
          animation-play-state: paused;
        }
        .logo-marquee__group {
          display: flex;
          align-items: center;
          gap: clamp(2.5rem, 6vw, 5rem);
          padding-right: clamp(2.5rem, 6vw, 5rem);
          flex-shrink: 0;
        }
        @keyframes logo-marquee {
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-marquee__track { animation: none; }
        }
      `}</style>
    </div>
  )
}

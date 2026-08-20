import type { CSSProperties } from 'react'

/* Shared tokens + the big wordmark style for the landing frame. */
export const INK = '#0A0A0A'
export const BG = '#F0F0F9'
export const BLUE = '#1F44FF'

/**
 * White text; the pinned frame layer carries `mix-blend-mode: difference`,
 * so this reads near-black over the pale page and inverts over any
 * image that scrolls beneath. Sized to fill the width when pinned.
 */
export const wordStyle: CSSProperties = {
  fontFamily: 'var(--font-display, system-ui), sans-serif',
  fontWeight: 700,
  fontSize: 'min(14.25vw, 11.25rem)',
  lineHeight: 0.82,
  letterSpacing: '-0.04em',
  color: '#ffffff',
  margin: 0,
  userSelect: 'none',
  willChange: 'transform',
}

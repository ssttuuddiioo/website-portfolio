import type { CSSProperties } from 'react'

/* Shared tokens + the big wordmark style for the landing frame. */

/** Page ground. Near-black, matching --color-bg-primary in globals.css. */
export const BG = '#0A0A0A'
/** Primary foreground on the page ground. */
export const INK = '#E8E4DF'
/** Elevated panels (nav dock, menu sheet) that must separate from the ground. */
export const SURFACE = '#141414'
/**
 * A fixed light, independent of the page ground. For type and marks that sit on
 * the cobalt panels or on imagery, where the foreground must stay light no
 * matter which way the page palette runs.
 */
export const PAPER = '#F0F0F9'
export const BLUE = '#1F44FF'

/** Ink at partial strength. Hairlines, secondary copy, placeholder plates. */
export const ink = (alpha: number) => `rgba(232, 228, 223, ${alpha})`

/**
 * White text; the pinned frame layer carries `mix-blend-mode: difference`,
 * so this reads near-white over the near-black page and inverts over any
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

/**
 * International Klein Blue. The footer ground: one saturated block that closes
 * every page and reads as a hard stop against the near-black body.
 */
export const IKB = '#002FA7'

/** PAPER at partial strength. Secondary type and hairlines on the IKB block. */
export const paper = (alpha: number) => `rgba(240, 240, 249, ${alpha})`

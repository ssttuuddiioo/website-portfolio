import { ImageResponse } from 'next/og'

/**
 * Favicon — a solid circle in the studio blue (#1F44FF, the accent used for
 * link and pill hovers across the landing). Kept as a shape rather than a
 * letterform so it stays legible at 16px.
 */

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// Keep in sync with BLUE in src/components/landing/landing-theme.ts.
const BLUE = '#1F44FF'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: BLUE,
          }}
        />
      </div>
    ),
    size,
  )
}

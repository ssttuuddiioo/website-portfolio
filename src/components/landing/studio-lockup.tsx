import Link from 'next/link'
import { wordStyle } from './landing-theme'

/**
 * The landing's corner lockup — STUDIO over a mirrored STUDIO — as a still
 * mark for pages that don't run the landing's animated one. Same type, same
 * scale against the same base size (WORD_SCALE_DESKTOP in agency-experience),
 * same 6px between the words, so it reads as the one mark from page to page.
 */
const SCALE = 0.2125

export function StudioLockup({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Studio Studio — home" className={`studio-lockup ${className ?? ''}`}>
      <span aria-hidden>STUDIO</span>
      <span aria-hidden className="studio-lockup-flip">
        STUDIO
      </span>
      <style>{`
        .studio-lockup {
          display: inline-flex;
          flex-direction: column;
          gap: 6px;
          font-family: ${wordStyle.fontFamily};
          font-weight: ${wordStyle.fontWeight};
          font-size: calc(min(14.25vw, 11.25rem) * ${SCALE});
          line-height: ${wordStyle.lineHeight};
          letter-spacing: ${wordStyle.letterSpacing};
          color: #fff;
          text-decoration: none;
          user-select: none;
          /* The landing sets the letters, not the box, on the --edge line:
             the box starts a side bearing (~0.19em) to the left of it. */
          margin-left: -0.193em;
        }
        /* Turned on its head, from the same left edge as the word above (as
           on the landing, where both boxes share one left). */
        .studio-lockup-flip {
          align-self: flex-start;
          transform: rotate(180deg);
        }
      `}</style>
    </Link>
  )
}

import type { ReactNode } from 'react'

/**
 * Phones get their own build of a page rather than the desktop one reflowed.
 * Both render, and CSS shows one, so the switch happens before hydration with
 * no flash. The breakpoint is the landing's own (.ss-mobile in
 * agency-experience): the desktop layouts lean on pointer hover below it.
 */
export function ByViewport({
  desktop,
  mobile,
}: {
  desktop: ReactNode
  mobile: ReactNode
}) {
  return (
    <>
      <div className="vp-desktop">{desktop}</div>
      <div className="vp-mobile">{mobile}</div>
      <style>{`
        .vp-mobile { display: none; }
        @media (max-width: 899px) {
          .vp-desktop { display: none; }
          .vp-mobile { display: block; }
        }
      `}</style>
    </>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LANDING_PROJECTS, type LandingProject } from '@/lib/landing-projects'
import { useLenis } from '@/lib/lenis-provider'
import { INK, BG } from './landing-theme'

/* ---- drum geometry ------------------------------------------------------ */

/** Row height, and the pitch the wheel is built from. */
const ITEM_H = 34
/**
 * Where the drum's centre sits. High on the screen: 45% of the viewport, less
 * 120px. Everything else on the page is placed against this, so the wheel and
 * what surrounds it can never drift apart.
 */
const WHEEL_TOP = 'calc(45% - 120px)'
/** Seven rows deep — what the drum shows at once. */
const WHEEL_H = ITEM_H * 7
/** The drum's edges, derived rather than restated. */
const WHEEL_BOTTOM = `calc(${WHEEL_TOP} + ${WHEEL_H / 2}px)`
const WHEEL_TOP_EDGE = `calc(${WHEEL_TOP} - ${WHEEL_H / 2}px)`
/**
 * Halfway between the top of the screen and the top of the drum, clear of the
 * status bar. Where the studio's line sits: it cannot share the space under the
 * wheel, because that now belongs to the panel.
 */
const ABOVE_WHEEL = `calc((env(safe-area-inset-top) + ${WHEEL_TOP_EDGE}) / 2)`
/**
 * Halfway between the bottom of the wheel and the bottom of the screen, where
 * the studio mark sits — and it follows automatically if the wheel moves.
 */
const BELOW_WHEEL = `calc((${WHEEL_BOTTOM} + 100%) / 2)`
/** Degrees between neighbouring rows. 180/ANGLE is how many fit the half-turn. */
const ANGLE = 15
/**
 * Cylinder radius that makes rows ANGLE apart sit exactly ITEM_H apart at the
 * face of the drum. Derived, not guessed: half a row's height over the tangent
 * of half its angle.
 */
const RADIUS = ITEM_H / 2 / Math.tan((ANGLE / 2) * (Math.PI / 180))
/** Past this the row has turned too far to read; it is hidden entirely. */
const CUTOFF = 82

/* ---- feel --------------------------------------------------------------- */

/**
 * How long, in ms, a released flick keeps carrying. Release velocity is
 * measured in px/ms, so velocity ÷ drag pitch × this is the distance in rows a
 * throw covers. Kept short: a wheel that keeps running after the finger leaves
 * is a wheel you have to fight to land on a particular row.
 */
const THROW_MS = 130
/**
 * Finger travel per row, as a multiple of the row's own height. Above 1 the
 * drum turns slower than the finger moves, which is what makes a single row
 * easy to stop on — the whole point of the thing is choosing, not travelling.
 */
const DRAG_PITCH = 1.7
/** Rows a wheel notch moves. */
const WHEEL_ROWS = 1 / 5
/** Quiet after the last wheel event before the drum settles to a row. */
const WHEEL_SETTLE = 130
/** How far past the ends a drag may pull before it is eased back. */
const OVERSHOOT = 0.55

/**
 * The description paragraph under a project. Off for now — the wheel and the
 * frame are carrying the page, and the copy runs 16 to 58 words, which is a
 * lot of movement under something that is meant to sit still. Flip to restore.
 */
const SHOW_DESCRIPTION = false

/**
 * Flat black, for the rows that are the studio rather than the work: Home, the
 * chapter break, and Contact. The projects in between are the only rows that
 * carry a picture, which is what makes them read as the content.
 */
const BLACK_FRAME = '/landing/opt/blank.png'

/**
 * The wheel is the whole of mobile: Home, About, the work, Contact. Each row
 * declares what it puts behind itself and what it puts under itself, so the
 * page has one loop rather than a set of special cases.
 */
type Row =
  | { kind: 'home'; label: string; frame: string; href: string }
  | { kind: 'about'; label: string; frame: string; href: string }
  | { kind: 'divider'; label: string; frame: string }
  | { kind: 'project'; label: string; frame: string; href: string; project: LandingProject }
  | { kind: 'contact'; label: string; frame: string; href: string }

/**
 * Who the work was made for. A subset of the desktop logo marquee (see
 * logo-marquee.tsx) — the names that carry without their marks, short enough
 * to set as one run of type on a phone.
 */
const CLIENTS = [
  'HBO',
  'Google',
  'Intel',
  'Sony',
  'Dolby',
  'Netflix',
  'Mercedes-Benz',
  'Michigan Central',
  'Cox',
  'New Museum',
]

const YEARS = LANDING_PROJECTS.map((p) => p.year)

const ROWS: Row[] = [
  { kind: 'home', label: 'Home', frame: BLACK_FRAME, href: '/' },
  {
    kind: 'about',
    label: 'About',
    frame: '/landing/opt/about.jpeg',
    href: '/about',
  },
  // A chapter break rather than a destination: it stops on black, states the
  // size of the body of work, and hands over to it.
  { kind: 'divider', label: 'Selected Projects', frame: BLACK_FRAME },
  ...LANDING_PROJECTS.map(
    (project): Row => ({
      kind: 'project',
      label: project.title,
      frame: project.image,
      href: `/work/${project.slug}`,
      project,
    }),
  ),
  // Black, like Home and the chapter break: the three rows that are the studio
  // speaking rather than the work. It also gives the form a clean ground.
  { kind: 'contact', label: 'Contact', frame: BLACK_FRAME, href: '/contact' },
]

const WORK_SUMMARY = `${LANDING_PROJECTS.length} projects · ${Math.min(
  ...YEARS,
)}–${Math.max(...YEARS)}`

const COUNT = ROWS.length
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * The mobile landing: an iOS-style picker drum of the work, over a full-bleed
 * frame of whatever is selected. Nothing on the page scrolls — the document is
 * locked and the gesture drives the wheel instead. A flick glides on its own
 * momentum and then snaps to the nearest row; rows curve away toward the top
 * and bottom, fading and tilting on a real cylinder rather than a flat list.
 *
 * The drum's position is a float held in a ref and written straight to the DOM
 * on each frame. React state carries only the *selected row*, which changes a
 * few times a gesture rather than sixty times a second — re-rendering eighteen
 * rows per frame would drop the very smoothness the wheel exists for.
 *
 * This exists because the desktop hero trail is pointer-driven and silent on
 * touch: without it, a phone never gets to browse the work by image at all.
 */
export function MobileProjectScroller() {
  const sectionRef = useRef<HTMLElement>(null)
  const rowRefs = useRef<(HTMLElement | null)[]>([])
  const lenis = useLenis()

  // Continuous position of the drum, in rows. 0 is the first project centred.
  const pos = useRef(0)
  const raf = useRef(0)
  const visible = useRef(false)
  // Glide state: where a throw started, where it is going, and when.
  const glide = useRef<{ from: number; to: number; t0: number; dur: number } | null>(null)
  const drag = useRef<{ y: number; t: number; v: number } | null>(null)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduced = useRef(false)

  // Selection and the two cross-fading frames move together, in one state, so
  // the frame can never lag a row behind the highlight.
  const [view, setView] = useState<{
    i: number
    frames: [string, string]
    top: 0 | 1
  }>({
    i: 0,
    frames: [ROWS[0].frame, ROWS[0].frame],
    top: 0,
  })
  const [live, setLive] = useState(false)
  const selected = useRef(0)

  const row = ROWS[view.i]

  /** Lay the rows out on the cylinder for the current position. */
  const paint = useCallback(() => {
    const p = pos.current
    for (let i = 0; i < COUNT; i++) {
      const el = rowRefs.current[i]
      if (!el) continue
      const deg = (i - p) * ANGLE
      if (Math.abs(deg) > CUTOFF) {
        el.style.visibility = 'hidden'
        continue
      }
      const rad = deg * (Math.PI / 180)
      el.style.visibility = 'visible'
      el.style.transform = `rotateX(${-deg}deg) translateZ(${RADIUS}px)`
      // Falls off with the cosine, squared so the shoulders of the drum dim
      // faster than the face — that is what reads as roundness.
      el.style.opacity = String(Math.max(0, Math.cos(rad)) ** 2)
    }
    const next = clamp(Math.round(p), 0, COUNT - 1)
    if (next !== selected.current) {
      selected.current = next
      setView((prev) => {
        if (prev.i === next) return prev
        const top: 0 | 1 = prev.top === 0 ? 1 : 0
        const frames: [string, string] = [...prev.frames]
        frames[top] = ROWS[next].frame
        return { i: next, frames, top }
      })
    }
  }, [])

  /**
   * Send the drum to a row, gliding a distance-proportional amount on the way.
   * The frame loop lives inside here rather than as its own callback: it has to
   * schedule itself, and a self-referencing useCallback is not a stable one.
   */
  const settle = useCallback(
    (target: number) => {
      const to = clamp(Math.round(target), 0, COUNT - 1)
      const from = pos.current
      if (reduced.current) {
        pos.current = to
        glide.current = null
        paint()
        return
      }
      glide.current = {
        from,
        to,
        t0: performance.now(),
        // Long throws take longer, but never so long that the wheel feels
        // slack — and never so short that a one-row snap looks like a jump.
        dur: clamp(Math.abs(to - from) * 130, 320, 1000),
      }
      const step = () => {
        const g = glide.current
        if (!g) {
          raf.current = 0
          return
        }
        const t = (performance.now() - g.t0) / g.dur
        if (t >= 1) {
          pos.current = g.to
          glide.current = null
          paint()
          raf.current = 0
          return
        }
        pos.current = g.from + (g.to - g.from) * easeOut(t)
        paint()
        raf.current = requestAnimationFrame(step)
      }
      if (!raf.current) raf.current = requestAnimationFrame(step)
    },
    [paint],
  )

  /* ---- visibility: the CSS breakpoint is the only source of truth -------- */
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ro = new ResizeObserver(([entry]) => {
      const on = entry.contentRect.height > 0
      visible.current = on
      setLive(on)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // First paint of the drum once the rows exist.
  useEffect(() => {
    if (live) paint()
  }, [live, paint])

  // The frames are small pre-optimised AVIFs; pulling them up front means the
  // cross-fade never waits on a network round trip mid-gesture.
  useEffect(() => {
    if (!live) return
    ROWS.forEach((r) => {
      const img = new window.Image()
      img.src = r.frame
    })
  }, [live])

  /* ---- document lock ---------------------------------------------------- */
  useEffect(() => {
    if (!live) return
    const html = document.documentElement
    const body = document.body
    const prev = {
      html: html.style.overflow,
      body: body.style.overflow,
      overscroll: body.style.overscrollBehavior,
    }
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    // The layout wraps every page in Lenis, which runs its own smooth-scroll
    // loop off wheel and touch. Locking the document is not enough: Lenis keeps
    // consuming the same gestures to drive a scroll that has nowhere to go.
    lenis?.stop()
    return () => {
      html.style.overflow = prev.html
      body.style.overflow = prev.body
      body.style.overscrollBehavior = prev.overscroll
      lenis?.start()
    }
  }, [live, lenis])

  /* ---- gestures --------------------------------------------------------- */
  useEffect(() => {
    // Attached unconditionally and gated inside on the section's own measured
    // height: gating the attachment on state leaves the page inert with no way
    // to recover if that state is ever wrong.
    const el = sectionRef.current
    if (!el) return

    const stop = () => {
      glide.current = null
      if (raf.current) {
        cancelAnimationFrame(raf.current)
        raf.current = 0
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      visible.current = el.getBoundingClientRect().height > 0
      if (!visible.current) return
      stop()
      drag.current = { y: e.touches[0].clientY, t: performance.now(), v: 0 }
    }

    const onTouchMove = (e: TouchEvent) => {
      const d = drag.current
      if (!visible.current || !d) return
      if (e.cancelable) e.preventDefault()
      const y = e.touches[0].clientY
      const now = performance.now()
      const dy = d.y - y
      const dt = Math.max(1, now - d.t)
      // px/ms, smoothed so one jittery sample cannot define the throw.
      d.v = d.v * 0.7 + (dy / dt) * 0.3
      d.y = y
      d.t = now
      // Dragging up walks down the list, as scrolling would. Past either end
      // the drum still moves, but heavily damped, so it reads as resistance.
      const rows = dy / (ITEM_H * DRAG_PITCH)
      let next = pos.current + rows
      if (next < 0 || next > COUNT - 1) next = pos.current + rows * 0.3
      pos.current = clamp(next, -OVERSHOOT, COUNT - 1 + OVERSHOOT)
      paint()
    }

    const onTouchEnd = () => {
      const d = drag.current
      drag.current = null
      if (!visible.current || !d) return
      // Where the throw would carry it, snapped to the nearest row.
      settle(pos.current + (d.v / (ITEM_H * DRAG_PITCH)) * THROW_MS)
    }

    const onWheel = (e: WheelEvent) => {
      if (!visible.current) return
      if (e.cancelable) e.preventDefault()
      stop()
      pos.current = clamp(
        pos.current + Math.sign(e.deltaY) * WHEEL_ROWS * Math.min(3, Math.abs(e.deltaY) / 40),
        -OVERSHOOT,
        COUNT - 1 + OVERSHOOT,
      )
      paint()
      if (wheelTimer.current) clearTimeout(wheelTimer.current)
      wheelTimer.current = setTimeout(() => settle(pos.current), WHEEL_SETTLE)
    }

    const onKey = (e: KeyboardEvent) => {
      if (!visible.current) return
      if (e.key === 'ArrowDown') settle(Math.round(pos.current) + 1)
      else if (e.key === 'ArrowUp') settle(Math.round(pos.current) - 1)
      else return
      e.preventDefault()
    }

    const opts = { passive: false, capture: true } as const
    window.addEventListener('touchstart', onTouchStart, { capture: true })
    window.addEventListener('touchmove', onTouchMove, opts)
    window.addEventListener('touchend', onTouchEnd, { capture: true })
    window.addEventListener('touchcancel', onTouchEnd, { capture: true })
    window.addEventListener('wheel', onWheel, opts)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('touchstart', onTouchStart, { capture: true })
      window.removeEventListener('touchmove', onTouchMove, opts)
      window.removeEventListener('touchend', onTouchEnd, { capture: true })
      window.removeEventListener('touchcancel', onTouchEnd, { capture: true })
      window.removeEventListener('wheel', onWheel, opts)
      window.removeEventListener('keydown', onKey)
      stop()
      if (wheelTimer.current) clearTimeout(wheelTimer.current)
    }
  }, [paint, settle])

  return (
    <section ref={sectionRef} className="mps" aria-label="Selected work">
      <style>{`
        /* Fixed to the viewport, so there is nothing to scroll even before the
           document lock. touch-action stops the browser claiming the swipe
           before the handler sees it; taps are unaffected. */
        .mps {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background: ${BG};
          touch-action: none;
          overscroll-behavior: none;
          display: flex;
          flex-direction: column;
        }
        .mps-bg { position: absolute; inset: 0; z-index: 0; }
        .mps-bg img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 620ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mps-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10, 10, 10, 0.42) 0%,
            rgba(10, 10, 10, 0.12) 40%,
            rgba(10, 10, 10, 0.84) 100%
          );
        }

        /* A pool of shade under the drum, so the type reads against any frame
           and the wheel separates from the picture instead of floating on it.
           Sized and placed to the wheel, and soft-edged so it never draws a
           border of its own. */
        .mps-wheelbg {
          position: absolute;
          left: 50%;
          top: ${WHEEL_TOP};
          width: min(30rem, 124vw);
          height: ${ITEM_H * 13}px;
          transform: translate(-50%, -50%);
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            ellipse 62% 50% at 50% 50%,
            rgba(10, 10, 10, 0.82) 0%,
            rgba(10, 10, 10, 0.6) 42%,
            rgba(10, 10, 10, 0.22) 68%,
            rgba(10, 10, 10, 0) 82%
          );
        }

        /* The drum. Perspective on the frame, the cylinder inside it.
           Absolutely placed rather than flowed: anything below it changing
           height — the copy is a different length for every project — would
           otherwise move the wheel, and the wheel must never move. */
        .mps-wheel {
          position: absolute;
          left: 50%;
          top: ${WHEEL_TOP};
          transform: translate(-50%, -50%);
          z-index: 2;
          width: min(15rem, 62vw);
          height: ${WHEEL_H}px;
          perspective: 620px;
          perspective-origin: 50% 50%;
        }
        .mps-drum {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
        }
        /* The highlight box the selected row sits in. */
        .mps-band {
          position: absolute;
          left: -0.35rem;
          right: -0.35rem;
          top: 50%;
          height: ${ITEM_H}px;
          margin-top: -${ITEM_H / 2}px;
          border-top: 1px solid rgba(232, 228, 223, 0.28);
          border-bottom: 1px solid rgba(232, 228, 223, 0.28);
          background: rgba(10, 10, 10, 0.5);
          pointer-events: none;
        }
        .mps-row {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: ${ITEM_H}px;
          margin-top: -${ITEM_H / 2}px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0 0.55rem;
          color: rgba(232, 228, 223, 0.82);
          font-size: 0.78rem;
          /* Fixed for every row, active or not — see the note below. */
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.01em;
          text-decoration: none;
          white-space: nowrap;
          backface-visibility: hidden;
          will-change: transform, opacity;
          transition: color 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* Only the row in the band is at full strength; the drum's own cosine
           fade takes care of the rest. Weight is deliberately NOT changed here:
           going 500 -> 600 reflows every glyph, so the row would grow and the
           arrow shift each time the selection passed — which is what read as
           the rows changing size at random. Brightness alone does the work. */
        .mps-row[data-active='true'] { color: #fff; }
        .mps-arrow { flex: none; opacity: 0.6; }

        /* The chapter break. Reads as a caption on the wheel, not an item on
           it: no arrow, tracked out, quieter even when it is the selection. */
        .mps-row--divider {
          justify-content: center;
          font-size: 0.58rem;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.5);
        }
        .mps-row--divider[data-active='true'] { color: rgba(232, 228, 223, 0.8); }

        /* Both are placed against the drum, so raising or lowering the wheel
           carries them with it — but they sit on opposite sides of it. The mark
           takes the open ground below; the tagline goes above, because the
           space below now belongs to the panel and the two would print over
           each other on the About row. */
        .mps-above {
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          pointer-events: none;
          opacity: 0;
          transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mps-above[data-on='true'] { opacity: 1; }

        .mps-mark {
          top: ${BELOW_WHEEL};
          width: min(11rem, 46vw);
        }
        .mps-marklogo { width: 100%; height: auto; }

        /* The studio's line, above the drum. Restored: an earlier edit sliced
           this rule out with the block above it, leaving the paragraph to
           render at browser defaults — full width, full size — straight over
           the client roster. */
        .mps-tagline-line {
          display: block;
          white-space: nowrap;
        }
        .mps-tagline {
          top: ${ABOVE_WHEEL};
          margin: 0;
          width: min(17rem, 74vw);
          text-align: center;
          font-size: clamp(0.95rem, 4.2vw, 1.12rem);
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: -0.022em;
          color: ${INK};
        }

        /* The chapter break's count, under the wheel. */
        .mps-summary {
          margin: 0 auto;
          font-size: 0.66rem;
          line-height: 1.4;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.55);
        }
        .mps-about-lede {
          margin: 0 auto;
          max-width: 20rem;
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.35;
          letter-spacing: -0.02em;
          color: ${INK};
        }
        /* The roster, ruled off above and below so it reads as a register
           rather than as more sentence. */
        .mps-clients {
          margin: 1.15rem auto 0;
          padding: 0.85rem 0;
          max-width: 20rem;
          border-top: 1px solid rgba(232, 228, 223, 0.16);
          border-bottom: 1px solid rgba(232, 228, 223, 0.16);
          font-size: 0.6rem;
          line-height: 1.85;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.6);
        }


        /* The whole field below the drum, top and bottom both anchored — so
           the box never changes size as rows swap copy of different lengths,
           and a row can be placed anywhere within it. */
        .mps-panel {
          position: absolute;
          left: 0;
          right: 0;
          top: ${WHEEL_BOTTOM};
          bottom: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          /* A project's services and CTA belong low, near the thumb. */
          justify-content: flex-end;
          padding: 1.25rem 1.5rem calc(1.6rem + env(safe-area-inset-bottom));
          text-align: center;
          color: ${INK};
          /* Only the controls inside are interactive; a swipe anywhere else
             over this area still turns the wheel. */
          pointer-events: none;
        }
        .mps-panel a,
        .mps-panel button,
        .mps-panel input,
        .mps-panel textarea,
        .mps-panel form { pointer-events: auto; }

        /* Contact is a destination, not a footnote: it takes the middle of the
           space rather than sitting on the bottom edge. */
        .mps-panel[data-kind='contact'],
        .mps-panel[data-kind='about'] { justify-content: center; }
        .mps-desc {
          margin: 0 auto;
          max-width: 26rem;
          font-size: 0.88rem;
          line-height: 1.5;
          /* Descriptions run 16 to 58 words; the frame is fixed, so the longest
             is clamped rather than allowed to push the panel off screen. */
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .mps-services {
          margin: 0 auto;
          max-width: 24rem;
          font-size: 0.76rem;
          line-height: 1.45;
          color: rgba(232, 228, 223, 0.72);
        }
        .mps-more {
          display: inline-block;
          margin-top: 1.35rem;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: ${INK};
          text-decoration: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .mps-bg img, .mps-row { transition: none; }
        }
      `}</style>

      <div className="mps-bg" aria-hidden>
        {[0, 1].map((i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={view.frames[i]}
            alt=""
            style={{ opacity: view.top === i ? 1 : 0 }}
          />
        ))}
        <div className="mps-scrim" />
      </div>

      <div className="mps-wheelbg" aria-hidden />

      {/* The slot above the wheel. Home puts the mark here and nothing under
          the wheel; About puts the studio's line here and keeps the live detail
          below. Both are always mounted so they fade rather than appear, and
          both sit on the same anchor so one replaces the other in place. */}
      <p className="mps-above mps-tagline font-display" data-on={row.kind === 'about'} aria-hidden>
        {/* Three fixed lines, each unbreakable — so the tagline reads the same
            on every handset and the city never splits across a line end. */}
        <span className="mps-tagline-line">A creative</span>
        <span className="mps-tagline-line">technology practice</span>
        <span className="mps-tagline-line">in Brooklyn, New York.</span>
      </p>

      <div className="mps-above mps-mark" data-on={row.kind === 'home'} aria-hidden>
        {/* White type on transparency, generated from logo.png. The blend
            trick the project page uses cannot work here: this element sits in
            a stacking context of its own (absolute + z-index), so mix-blend
            has no backdrop to lighten against and the source's opaque field
            paints as a black box around the mark. A real asset has no such
            dependency on what happens to be behind it. */}
        <Image
          src="/logo-white.png"
          alt=""
          width={1254}
          height={612}
          priority
          className="mps-marklogo"
        />
      </div>

      <div className="mps-wheel">
        <div className="mps-band" aria-hidden />
        <div className="mps-drum">
          {ROWS.map((r, i) =>
            r.kind === 'divider' ? (
              <div
                key={r.label}
                ref={(el) => {
                  rowRefs.current[i] = el
                }}
                className="mps-row mps-row--divider font-mono"
                data-active={i === view.i}
              >
                <span>{r.label}</span>
              </div>
            ) : (
              <Link
                key={r.label}
                href={r.href}
                ref={(el) => {
                  rowRefs.current[i] = el
                }}
                className="mps-row font-display"
                data-active={i === view.i}
              >
                <span>{r.label}</span>
                <span className="mps-arrow" aria-hidden>
                  →
                </span>
              </Link>
            ),
          )}
        </div>
      </div>

      {/* What sits under the wheel, per row. Hidden from assistive tech: the
          row above is a real link and already carries the destination. */}
      <div className="mps-panel" data-kind={row.kind} aria-hidden>
        {row.kind === 'about' && (
          <>
            {/* What the studio actually makes, said once. The tagline above the
                wheel says what it is; this says what comes out of it. */}
            <p className="mps-about-lede font-display">
              Installations, lighting systems, and the software that runs them.
            </p>
            <p className="mps-clients font-mono">
              {CLIENTS.join(' · ')}
            </p>
            <Link href="/about" className="mps-more font-display">
              Read about the studio
            </Link>
          </>
        )}

        {row.kind === 'divider' && (
          <p className="mps-summary font-mono">{WORK_SUMMARY}</p>
        )}

        {row.kind === 'project' && (
          <>
            {SHOW_DESCRIPTION && row.project.description && (
              <p className="mps-desc font-display">{row.project.description}</p>
            )}
            {row.project.services?.length ? (
              <p className="mps-services font-display">
                {row.project.services.join(', ')}
              </p>
            ) : null}
            <Link href={row.href} className="mps-more font-display">
              See project
            </Link>
          </>
        )}

        {row.kind === 'contact' && (
          <>
            <p className="mps-about-lede font-display">
              Tell us what you have in mind and we&apos;ll set up a call.
            </p>
            <Link href={row.href} className="mps-more font-display">
              Get in touch
            </Link>
          </>
        )}
      </div>
    </section>
  )
}

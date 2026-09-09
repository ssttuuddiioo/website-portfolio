'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LANDING_PROJECTS, type LandingProject } from '@/lib/landing-projects'
import { useLenis } from '@/lib/lenis-provider'
import { INK, BG, BLUE } from './landing-theme'

/* ---- drum geometry ------------------------------------------------------ */

/**
 * Row height, and the pitch the wheel is built from. Every other figure on the
 * drum — its radius, its window, the band, the throw — is derived from it.
 */
const ITEM_H = 28
/**
 * Where the drum's centre sits. Everything else on the page is placed against
 * this — the mark above, the card under it — so the wheel and what surrounds
 * it can never drift apart. Move this one value and the whole page follows.
 *
 * A custom property rather than a literal, because it is no longer one value:
 * the drum sits high enough to leave the card a full pocket beneath it, and on
 * a short viewport that lift has to give some of itself back or the wheel
 * climbs into the mark. A variable is the only way a media query can reach it,
 * since every rule downstream is built by string interpolation.
 */
const WHEEL_TOP = 'var(--mps-wheel-top)'
/**
 * The drum's default centre, and the same figure on a short screen. 45% less
 * 120px lifts the wheel a full 100px off where it used to sit — the room the
 * card needs. Below 720px tall there is not 100px to give, so it keeps half.
 */
const WHEEL_CENTRE = 'calc(45% - 120px)'
const WHEEL_CENTRE_SHORT = 'calc(45% - 60px)'
/**
 * Air under the card, on top of the home indicator's own inset. The card hangs
 * from the foot of the panel, so this is the only thing holding it off the
 * bottom edge — and 100px of it is what stops the button reading as something
 * stuck to the bottom of the screen. A short viewport does not have 100px
 * spare between the drum and the edge, so it keeps about half.
 */
const PANEL_FOOT = '100px'
const PANEL_FOOT_SHORT = '48px'
/**
 * Five rows deep — what the drum shows at once. Together with the shorter row
 * this takes the wheel from 238px to 140px, 41% off, without touching the type
 * or the feel: five is the floor the mask allows. Its fully-opaque band is
 * 22% of the window (39%-61%), so at four rows of 28px that band would be
 * narrower than a row and the SELECTED row would come up faded at its own
 * edges. At five it is 30.8px against a 28px row, and the selection stays
 * solid.
 */
const WHEEL_H = ITEM_H * 5
/**
 * The drum's width, and the only place it is stated. The glass panel behind
 * the wheel and the selection band in front of it both read from this, so the
 * three share one edge — the panel used to run 2.5rem wider than the rows it
 * was backing and the band another 0.35rem past that, which read as the wheel
 * sitting inside something rather than as one control.
 */
const WHEEL_W = 'min(17.5rem, 74vw)'
/** The drum's bottom edge, derived rather than restated — where the panel starts. */
const WHEEL_BOTTOM = `calc(${WHEEL_TOP} + ${WHEEL_H / 2}px)`
/** Degrees between neighbouring rows. 180/ANGLE is how many fit the half-turn. */
const ANGLE = 15
/**
 * Cylinder radius that makes rows ANGLE apart sit exactly ITEM_H apart at the
 * face of the drum. Derived, not guessed: half a row's height over the tangent
 * of half its angle.
 */
/*
 * Rounded, and that matters: this value is interpolated into the <style> tag,
 * which is server-rendered. Math.tan is only "implementation-approximated" by
 * the spec, so Node's V8 and iOS Safari's JavaScriptCore can disagree in the
 * final bits — enough for the server to emit 129.12781991632758 and the phone
 * to hydrate 129.1278199163276, which React reports as a hydration mismatch.
 * Two decimals is 0.01px of precision and identical on every engine.
 */
const RADIUS =
  Math.round((ITEM_H / 2 / Math.tan((ANGLE / 2) * (Math.PI / 180))) * 100) / 100
/** Past this the row has turned too far to read; it is hidden entirely. */
const CUTOFF = 82
/**
 * How far the masked drum frame overhangs the wheel on each side. The frame's
 * edge fade is a mask, and mask-clip is the border box — so without shoulders
 * the mask would double as a horizontal crop on the longest project titles.
 */
const FRAME_PAD = 28

/* ---- feel --------------------------------------------------------------- */

/**
 * Throw physics, in rows rather than pixels — ported from beui.dev's wheel
 * picker, which models the coast properly instead of extrapolating linearly.
 * A flick decelerates at a constant rate, so the distance it covers goes with
 * the SQUARE of the release velocity: a gentle nudge moves a row or two, a
 * hard fling crosses the list. Linear extrapolation (velocity × a fixed time)
 * gets both ends wrong — too eager when slow, too short when fast.
 */
const DECELERATION = 0.00042
/** Ceiling on a release, in rows/ms. Caps a hard fling to something catchable. */
const MAX_VELOCITY = 0.18
/**
 * How much of the end of a drag defines its velocity. Averaging the last 90ms
 * beats reading the final two samples: one stuttered frame at lift-off would
 * otherwise make an even throw feel like it caught or slipped.
 */
const VELOCITY_WINDOW = 90
/**
 * Finger travel per row, as a multiple of the row's own height. Above 1 the
 * drum turns slower than the finger moves, which is what makes a single row
 * easy to stop on — the whole point of the thing is choosing, not travelling.
 *
 * Raised from 1.7 when the row shrank from 34px to 28px. It is a MULTIPLE of
 * the row, so leaving it alone would have cut the finger travel per row by the
 * same 18% and made the wheel that much twitchier than it was tuned to be.
 * 2.05 x 28 holds the absolute distance at the 58px it has always been.
 */
const DRAG_PITCH = 2.05
/** Rows a wheel notch moves. */
const WHEEL_ROWS = 1 / 5
/** Quiet after the last wheel event before the drum settles to a row. */
const WHEEL_SETTLE = 130
/** How far past the ends a drag may pull before it is eased back. */
const OVERSHOOT = 0.55
/**
 * How far past a stop the drum runs when a throw arrives with travel still in
 * hand, in rows — half a row, about 14px on the face. The list has two ends
 * and they are both places: About at the top, Contact at the bottom. Without
 * this the drum simply stopped dead on them, which reads as the wheel
 * breaking rather than as the list ending. Kept under one row so nothing ever
 * appears past the end, because there is nothing past the end.
 */
const END_BOUNCE = 0.5
/** The return from that overshoot. Short and flat — settling, not a throw. */
const END_BOUNCE_BACK = 280

/**
 * Flat black, for the rows that are the studio rather than the work: Home, the
 * chapter break, and Contact. The projects in between are the only rows that
 * carry a picture, which is what makes them read as the content.
 */
const BLACK_FRAME = '/landing/opt/blank.png'

/**
 * About's ground. It used to be the footer's IKB block — one flat colour for
 * the row where the studio speaks rather than the work. That reasoning held
 * while About was the row the wheel opened on; now that it opens on the work,
 * a solid field one notch up reads as a hole in the reel rather than as a
 * change of voice. A picture of the work keeps the run of frames unbroken.
 */
const ABOUT_FRAME = '/landing/opt/light-around-us2.avif'

/**
 * The wheel is the whole of mobile: About, the work, Contact. Each row declares
 * what it puts behind itself and what it puts under itself, so the page has
 * one loop rather than a set of special cases.
 *
 * The first row used to be Home — a row whose link pointed back at the page it
 * was already on, carrying the studio's line as a passenger. It is About now,
 * and it says the same thing under its own name: one row above the work,
 * reachable in a single notch up from where the wheel opens.
 */
type Row =
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
  { kind: 'about', label: 'About', frame: ABOUT_FRAME, href: '/about' },
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
/**
 * Where the wheel opens: the first project, not the first row. Landing on the
 * studio's own row put a black frame and a paragraph in front of a visitor who
 * came to see the work — so the drum starts one notch into Selected Projects,
 * on LOOP, with its picture already behind the glass. About sits just above,
 * where a single notch up reaches it.
 */
const INITIAL = ROWS.findIndex((r) => r.kind === 'project')
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
/**
 * Overshoots the detent and settles back into it. The little spring at the end
 * of a snap that makes a wheel feel mechanical rather than animated. BACK sets
 * how far past the row it drifts before returning.
 */
const BACK = 1.35
const easeOutBack = (t: number) =>
  1 + (BACK + 1) * Math.pow(t - 1, 3) + BACK * Math.pow(t - 1, 2)

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

  // Continuous position of the drum, in rows — see INITIAL for where it opens.
  const pos = useRef(INITIAL)
  const raf = useRef(0)
  const visible = useRef(false)
  // Glide state: where a throw started, where it is going, and when.
  const glide = useRef<{
    from: number
    to: number
    t0: number
    dur: number
    ease: (t: number) => number
    /** Row to glide to once this one lands, or null to stop. Only an end
     *  bounce uses it: the first leg runs past the stop, this brings it back. */
    rest: number | null
  } | null>(null)
  // Absolute from the start of the gesture rather than accumulated per move:
  // the drum lands exactly where the finger says, with no drift over a long
  // drag. `pts` is the tail used to measure the release.
  const drag = useRef<{
    y0: number
    pos0: number
    pts: [number, number][]
  } | null>(null)
  // One paint per frame. Raw touchmove fires several times per frame on a
  // high-refresh screen, and painting each one is wasted work that shows.
  const dragFrame = useRef(0)
  const latestY = useRef(0)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduced = useRef(false)

  // Selection and the two cross-fading frames move together, in one state, so
  // the frame can never lag a row behind the highlight.
  const [view, setView] = useState<{
    i: number
    frames: [string, string]
    top: 0 | 1
  }>({
    i: INITIAL,
    frames: [ROWS[INITIAL].frame, ROWS[INITIAL].frame],
    top: 0,
  })
  const [live, setLive] = useState(false)
  const selected = useRef(INITIAL)

  const row = ROWS[view.i]

  /** Lay the rows out on the cylinder for the current position. */
  const paint = useCallback(() => {
    const p = pos.current
    for (let i = 0; i < COUNT; i++) {
      const el = rowRefs.current[i]
      if (!el) continue
      const deg = (i - p) * ANGLE
      // Write visibility only on change: an unconditional write every frame
      // thrashes style recalc, and on a 120Hz phone that is what turns a drag
      // draggy. (The same guard beui's picker calls out.)
      if (Math.abs(deg) > CUTOFF) {
        if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'
        continue
      }
      const rad = deg * (Math.PI / 180)
      if (el.style.visibility !== 'visible') el.style.visibility = 'visible'
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
    (target: number, ease: (t: number) => number = easeOut, dur?: number) => {
      const to = clamp(Math.round(target), 0, COUNT - 1)
      const from = pos.current
      if (reduced.current) {
        pos.current = to
        glide.current = null
        paint()
        return
      }
      // How much of the throw the stop has to absorb: whatever the target
      // asked for beyond the first or last row. It only counts while the drum
      // is still inside the list — a finger that is already holding it past an
      // end is being released from a stretch, and a stretch just returns.
      const spill = Math.max(0, target < 0 ? -target : target - (COUNT - 1))
      const inside = from >= 0 && from <= COUNT - 1
      const bounce =
        spill > 0 && inside
          ? Math.min(END_BOUNCE, END_BOUNCE * spill) * (to === 0 ? -1 : 1)
          : 0
      glide.current = {
        from,
        // Aim past the stop when there is spill to absorb, and let `rest`
        // bring it back. With no bounce the two are the same row and nothing
        // chains, so every other throw is untouched.
        to: to + bounce,
        rest: bounce ? to : null,
        // A bounce supplies its own shape across two legs; easeOutBack's
        // detent overshoot on top of it would be a wobble against a wall.
        ease: bounce ? easeOut : ease,
        t0: performance.now(),
        // Long throws take longer, but never so long that the wheel feels
        // slack — and never so short that a one-row snap looks like a jump.
        // Root, not linear: a throw across the list should not take ten times
        // as long as one across ten rows, only three.
        dur: dur ?? clamp(Math.sqrt(Math.abs(to - from)) * 280 + 220, 300, 1200),
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
          if (g.rest !== null) {
            // The stop has been hit. Come back to the row it belongs to.
            glide.current = {
              from: g.to,
              to: g.rest,
              rest: null,
              ease: easeOut,
              t0: performance.now(),
              dur: END_BOUNCE_BACK,
            }
            paint()
            raf.current = requestAnimationFrame(step)
            return
          }
          glide.current = null
          paint()
          raf.current = 0
          return
        }
        pos.current = g.from + (g.to - g.from) * g.ease(t)
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
      const y = e.touches[0].clientY
      drag.current = { y0: y, pos0: pos.current, pts: [[y, performance.now()]] }
    }

    const onTouchMove = (e: TouchEvent) => {
      const d = drag.current
      if (!visible.current || !d) return
      if (e.cancelable) e.preventDefault()
      const y = e.touches[0].clientY
      // Record every sample — the release velocity wants them all — but only
      // render the newest position, once, on the next frame.
      latestY.current = y
      d.pts.push([y, performance.now()])
      if (d.pts.length > 8) d.pts.shift()
      if (dragFrame.current) return
      dragFrame.current = requestAnimationFrame(() => {
        dragFrame.current = 0
        const dd = drag.current
        if (!dd) return
        // Dragging up walks down the list, as scrolling would. Past either end
        // the drum still moves, but the overshoot itself is damped, so the
        // resistance grows with how far you have pulled.
        let next = dd.pos0 + (dd.y0 - latestY.current) / (ITEM_H * DRAG_PITCH)
        if (next < 0) next *= 0.3
        else if (next > COUNT - 1) next = COUNT - 1 + (next - (COUNT - 1)) * 0.3
        pos.current = clamp(next, -OVERSHOOT, COUNT - 1 + OVERSHOOT)
        paint()
      })
    }

    const onTouchEnd = () => {
      const d = drag.current
      drag.current = null
      if (dragFrame.current) {
        cancelAnimationFrame(dragFrame.current)
        dragFrame.current = 0
      }
      if (!visible.current || !d) return

      // Release velocity in rows/ms, averaged over the last VELOCITY_WINDOW of
      // the gesture rather than read off the final pair of samples.
      const pts = d.pts
      let v = 0
      if (pts.length > 1) {
        const latest = pts[pts.length - 1]
        let ref = pts[0]
        for (const pt of pts) {
          if (latest[1] - pt[1] <= VELOCITY_WINDOW) {
            ref = pt
            break
          }
        }
        const dt = latest[1] - ref[1]
        if (dt > 0) {
          v = clamp(
            (ref[0] - latest[0]) / (ITEM_H * DRAG_PITCH) / dt,
            -MAX_VELOCITY,
            MAX_VELOCITY,
          )
        }
      }

      // Pulled past an end and let go: no coast — the stretch just returns.
      // easeOutBack rather than a flat ease, so it comes back through the
      // detent and settles into it instead of arriving and stopping.
      if (pos.current < 0 || pos.current > COUNT - 1) {
        settle(pos.current, easeOutBack, 260)
        return
      }
      // Where a coast at this velocity runs out, and the row nearest to it.
      const coast = ((v * v) / (2 * DECELERATION)) * Math.sign(v)
      settle(pos.current + coast, easeOutBack)
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
      wheelTimer.current = setTimeout(() => settle(pos.current, easeOutBack, 260), WHEEL_SETTLE)
    }

    const onKey = (e: KeyboardEvent) => {
      if (!visible.current) return
      if (e.key === 'ArrowDown') settle(Math.round(pos.current) + 1, easeOutBack, 300)
      else if (e.key === 'ArrowUp') settle(Math.round(pos.current) - 1, easeOutBack, 300)
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
      if (dragFrame.current) cancelAnimationFrame(dragFrame.current)
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
          --mps-wheel-top: ${WHEEL_CENTRE};
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
          /* No filter. Dimming the whole frame to make the menu readable cost
             the picture everything it was there for — the separation belongs
             behind the drum only, where the type actually is. See .mps-wheelbg. */
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

        /* The drum's window. This used to be a wide pool of shade bled across
           the whole middle of the screen, which is why the frame behind it had
           to be filtered down to stay legible — the shade was never dark enough
           where the type was, and too dark everywhere else.

           It is a panel now: sized to the drum, opaque enough on its own, and
           blurring only what is directly behind it. The picture outside it
           keeps its full colour and brightness, because nothing is being asked
           of it there. Frosted glass, and the wheel turns behind the glass. */
        .mps-wheelbg {
          position: absolute;
          left: 50%;
          top: ${WHEEL_TOP};
          /* Exactly the drum's width — see WHEEL_W. */
          width: ${WHEEL_W};
          height: ${WHEEL_H}px;
          transform: translate(-50%, -50%);
          z-index: 1;
          pointer-events: none;
          border-radius: 3px;
          background: rgba(10, 10, 10, 0.58);
          -webkit-backdrop-filter: blur(18px) saturate(1.1);
          backdrop-filter: blur(18px) saturate(1.1);
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
          width: ${WHEEL_W};
          height: ${WHEEL_H}px;
        }
        /* The drum's own frame. Carries the perspective (so it stays the direct
           parent of .mps-drum) and the edge fade.

           Rows used to wink out the instant they passed the cutoff angle. A
           drum's far face doesn't vanish, it turns into shadow — so the top and
           bottom dissolve and a row leaves by going away rather than by being
           switched off. The mask sits here rather than on .mps-wheel because
           .mps-band overhangs the wheel by design and mask-clip would shear its
           ends off, and it cannot sit on .mps-drum itself because a mask
           flattens the 3D context it would be masking. */
        .mps-drumframe {
          position: absolute;
          /* Wider than the wheel by FRAME_PAD. mask-clip is border-box, so the
             mask cuts anything painted outside this element — the shoulders
             keep that edge away from the type. */
          inset: 0 -${FRAME_PAD}px;
          perspective: 620px;
          perspective-origin: 50% 50%;
          /* Eleven stops rather than four. A two-stop ramp still resolves as a
             line you can point at — the eye finds the place where the fade
             starts. Spreading it across the outer third on an eased curve
             leaves nowhere for that edge to be, so the drum reads as turning
             away rather than as being cut off. */
          -webkit-mask-image: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.06) 9%,
            rgba(0, 0, 0, 0.22) 17%,
            rgba(0, 0, 0, 0.5) 24%,
            rgba(0, 0, 0, 0.8) 31%,
            rgba(0, 0, 0, 1) 39%,
            rgba(0, 0, 0, 1) 61%,
            rgba(0, 0, 0, 0.8) 69%,
            rgba(0, 0, 0, 0.5) 76%,
            rgba(0, 0, 0, 0.22) 83%,
            rgba(0, 0, 0, 0.06) 91%,
            rgba(0, 0, 0, 0) 100%
          );
          mask-image: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.06) 9%,
            rgba(0, 0, 0, 0.22) 17%,
            rgba(0, 0, 0, 0.5) 24%,
            rgba(0, 0, 0, 0.8) 31%,
            rgba(0, 0, 0, 1) 39%,
            rgba(0, 0, 0, 1) 61%,
            rgba(0, 0, 0, 0.8) 69%,
            rgba(0, 0, 0, 0.5) 76%,
            rgba(0, 0, 0, 0.22) 83%,
            rgba(0, 0, 0, 0.06) 91%,
            rgba(0, 0, 0, 0) 100%
          );
        }
        /* The cylinder's shading, painted rather than lit: the surface rolls
           away into shade top and bottom, and catches a thin highlight across
           the middle where it turns to face you. Two flat gradients, and the
           drum stops reading as rows on a slope. */
        .mps-shade {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background:
            linear-gradient(
              180deg,
              rgba(240, 240, 249, 0) 42%,
              rgba(240, 240, 249, 0.055) 50%,
              rgba(240, 240, 249, 0) 58%
            ),
            linear-gradient(
              180deg,
              rgba(10, 10, 10, 0.38) 0%,
              rgba(10, 10, 10, 0.26) 16%,
              rgba(10, 10, 10, 0.1) 32%,
              rgba(10, 10, 10, 0) 50%,
              rgba(10, 10, 10, 0.1) 68%,
              rgba(10, 10, 10, 0.26) 84%,
              rgba(10, 10, 10, 0.38) 100%
            );
        }
        .mps-drum {
          position: absolute;
          /* Inset by the frame's overhang, so a row is exactly the wheel's
             width however wide the masked frame around it runs. */
          inset: 0 ${FRAME_PAD}px;
          transform-style: preserve-3d;
          /* Pull the cylinder back by its own radius. Rows are placed at
             translateZ(+RADIUS) to seat them on the drum's face, which without
             this leaves the centre row 129px NEARER the eye than the frame —
             and perspective duly magnified it 1.26x, so the selected row
             rendered wider than the wheel it lives in and its title ran out
             past both ends. Sitting the drum back puts the face at z=0: true
             scale, and a row that fits the window it is read through. */
          transform: translateZ(-${RADIUS}px);
        }
        /* The highlight box the selected row sits in. Flush with the drum and
           with the glass behind it: the row's own 0.55rem of padding is what
           keeps the type off the band's ends, so the band does not need to
           reach past them to do it. */
        .mps-band {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: ${ITEM_H}px;
          margin-top: -${ITEM_H / 2}px;
          border-top: 1px solid rgba(232, 228, 223, 0.34);
          border-bottom: 1px solid rgba(232, 228, 223, 0.34);
          border-radius: 3px;
          background: rgba(10, 10, 10, 0.5);
          /* A shallow well: the drum is seen THROUGH this opening, so the lip
             above it casts down and the one below catches a little light. It
             is what stops the band reading as a rectangle laid on top. */
          box-shadow:
            inset 0 3px 5px -3px rgba(10, 10, 10, 0.85),
            inset 0 -3px 5px -3px rgba(240, 240, 249, 0.09);
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
          font-size: 0.84rem;
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

        /* Top of the screen, clear of the status bar — a masthead rather than
           a footer. Half the size it used to be: up there it only has to
           identify the page, not carry it. Anchored to the top edge and not to
           the wheel, so it holds still while the drum moves. */
        .mps-mark {
          top: calc(env(safe-area-inset-top) + 2.6rem);
          width: min(5.5rem, 23vw);
        }
        .mps-marklogo { width: 100%; height: auto; }


        /* The chapter break's count, under the wheel. */
        .mps-summary {
          margin: 0 auto;
          font-size: 0.66rem;
          line-height: 1.4;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.55);
        }
        /* The roster reads as a register rather than as more sentence. The
           rules that used to do that are the card's own row hairlines now. */
        .mps-card .mps-clients {
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.62rem;
          line-height: 1.7;
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
          /* The card hangs from the BOTTOM of the pocket. That fixes the one
             edge that matters — the button's — in the same place on every row,
             whatever the card above it runs to, and puts it where the thumb
             already is.

             This is also as far down as the card can go. A literal drop of
             200px from where the shorter drum leaves it would put the button
             about 16px past the safe area on a 6.1in phone, and .mps clips;
             hanging it from the foot lands ~185px down there, more on a larger
             screen, and cannot cut the button off on any of them. */
          justify-content: flex-end;
          padding: 1.1rem 1.5rem
            calc(${PANEL_FOOT} + env(safe-area-inset-bottom));
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


        /* ---- the card ------------------------------------------------------

           Everything under the drum used to be centred type laid straight on
           the photograph: no ground of its own, so it read only over the
           frames that happened to be dark, and the fix for that would have
           been dimming the whole picture — which is the one thing the frames
           are there for.

           So it is a card, in the drum's own material: the same glass, the
           same width, the same 3px corner, ruled into rows the way the band
           rules the wheel. It reads as the other half of one control rather
           than as a caption dropped on the image, it is legible over any
           frame because it carries its own ground, and it covers about a
           third of the screen instead of veiling all of it. The picture keeps
           the rest.

           Left-aligned, and that is half the legibility on its own: centred
           ragged copy over a moving photograph has no edge for the eye to
           return to. */
        .mps-card {
          width: ${WHEEL_W};
          border-radius: 3px;
          overflow: hidden;
          text-align: left;
          background: rgba(10, 10, 10, 0.58);
          -webkit-backdrop-filter: blur(18px) saturate(1.1);
          backdrop-filter: blur(18px) saturate(1.1);
        }
        /* Between rows only — the card's own edge already closes the ends.
           Same hairline the selection band uses, at the same weight. */
        .mps-card > * + * { border-top: 1px solid rgba(232, 228, 223, 0.16); }

        /* One cell of the grid: a mono key over its value. The key is the
           divider row's type at the divider row's weight, so the card and the
           wheel are speaking the same language. */
        .mps-cell { padding: 0.72rem 0.8rem; }
        /* Two keys abreast, where both values are short. Equal columns, so the
           second key lands on the same line whatever the first value runs to. */
        .mps-cell--split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 0.8rem;
        }
        .mps-key {
          display: block;
          margin-bottom: 0.32rem;
          font-size: 0.55rem;
          line-height: 1;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.5);
        }
        .mps-val {
          margin: 0;
          font-size: 0.75rem;
          line-height: 1.4;
          color: rgba(232, 228, 223, 0.92);
        }

        /* The project's line, as the card's opening row. */
        .mps-desc {
          margin: 0;
          padding: 0.85rem 0.8rem;
          font-size: 0.8rem;
          line-height: 1.5;
          color: ${INK};
          /* The card is narrower than the panel was, so the same words take
             more lines. Four is what the pocket holds; nothing in
             landing-projects runs past it since the copy was cut. */
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* The studio's own line — About and Contact. Larger than a project's
           description: it is a statement, not metadata. */
        .mps-lede {
          margin: 0;
          padding: 0.95rem 0.8rem;
          font-size: 0.92rem;
          font-weight: 500;
          line-height: 1.35;
          letter-spacing: -0.02em;
          color: ${INK};
        }
        /* The panel's action. It was a bold word with no decoration, which on
           a photo ground read as one more line of copy — nothing about it said
           it could be pressed. It is a solid block now, the same one the
           contact sheet's submit uses (see .mcf-submit in mobile-contact-form):
           ink field, mono caps, square corners. Inline rather than full width,
           because it sits under centred copy and a bar across the panel would
           outweigh what it follows.

           Sized for a thumb — the tap target clears 44px on its own padding —
           and it is the one element down here that takes pointer events, so it
           has to be unmissable to be worth anything.

           It is the card's last row: full width, square, closing the stack the
           way the ruled cells open it. No hairline above it — an ink field
           against glass is its own separation. */
        .mps-more {
          display: block;
          width: 100%;
          border: 0;
          border-top: 0;
          border-radius: 0;
          padding: 0.9rem 0.8rem;
          text-align: center;
          background: ${INK};
          color: ${BG};
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 200ms cubic-bezier(0.22, 1, 0.36, 1),
            color 200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* Says it goes somewhere. The panel is aria-hidden — the wheel row
           above is the real link — so this is decoration, not content. */
        .mps-more::after { content: ' →'; }
        /* No hover on a phone — the press is the only state there is to draw,
           and it is the same blue the contact sheet answers a tap with. */
        .mps-more:active { background: ${BLUE}; color: #fff; }
        /* Short viewports. The wheel keeps only half its lift — there is not
           100px to give above it — and the description loses a line, so the
           card still closes above the home indicator. */
        @media (max-height: 720px) {
          .mps { --mps-wheel-top: ${WHEEL_CENTRE_SHORT}; }
          .mps-desc { -webkit-line-clamp: 3; }
          .mps-cell { padding: 0.6rem 0.8rem; }
          .mps-panel {
            padding-bottom: calc(
              ${PANEL_FOOT_SHORT} + env(safe-area-inset-bottom)
            );
          }
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

      {/* The slot above the wheel, the mark alone. It used to show only on the
          first row, which worked while that row was the one the wheel opened
          on — now that the wheel opens on the work, hiding it there would
          leave the landing screen with nothing naming the studio. It is a
          masthead: anchored to the top edge, on for every row. */}
      <div className="mps-above mps-mark" data-on aria-hidden>
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
        <div className="mps-shade" aria-hidden />
        <div className="mps-drumframe">
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
      </div>

      {/* What sits under the wheel, per row. Hidden from assistive tech: the
          row above is a real link and already carries the destination. */}
      <div className="mps-panel" data-kind={row.kind} aria-hidden>
        {row.kind === 'about' && (
          <div className="mps-card">
            {/* What the studio actually makes, said once. The wheel opens one
                notch below this, so it is the first thing reached rather than
                the first thing shown. */}
            <p className="mps-lede font-display">
              Installations, lighting systems, and the software that runs them.
            </p>
            <div className="mps-cell">
              <span className="mps-key font-mono">Clients</span>
              <p className="mps-val mps-clients font-mono">
                {CLIENTS.join(' · ')}
              </p>
            </div>
            <Link href="/about" className="mps-more font-mono">
              Learn more
            </Link>
          </div>
        )}

        {/* The chapter break gets no card: it is a caption on the wheel, not a
            place, and its frame is flat black — there is nothing here for a
            ground to rescue. */}
        {row.kind === 'divider' && (
          <p className="mps-summary font-mono">{WORK_SUMMARY}</p>
        )}

        {row.kind === 'project' && (
          <div className="mps-card">
            {row.project.description && (
              <p className="mps-desc font-display">{row.project.description}</p>
            )}
            {/* Who and when, abreast — both values are a few words at most, and
                side by side they cost one row instead of two. */}
            <div className="mps-cell mps-cell--split">
              <div>
                <span className="mps-key font-mono">Client</span>
                <p className="mps-val font-display">
                  {row.project.clientShort ?? row.project.client}
                </p>
              </div>
              <div>
                <span className="mps-key font-mono">Year</span>
                <p className="mps-val font-mono">{row.project.year}</p>
              </div>
            </div>
            {row.project.services?.length ? (
              <div className="mps-cell">
                <span className="mps-key font-mono">Role</span>
                <p className="mps-val font-display">
                  {row.project.services.join(', ')}
                </p>
              </div>
            ) : null}
            <Link href={row.href} className="mps-more font-mono">
              See project
            </Link>
          </div>
        )}

        {row.kind === 'contact' && (
          <div className="mps-card">
            <p className="mps-lede font-display">
              Tell us what you have in mind and we&apos;ll set up a call.
            </p>
            <Link href={row.href} className="mps-more font-mono">
              Get in touch
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LANDING_PROJECTS, type LandingProject } from '@/lib/landing-projects'
import { useLenis } from '@/lib/lenis-provider'
import { INK, BG, IKB } from './landing-theme'

/* ---- drum geometry ------------------------------------------------------ */

/** Row height, and the pitch the wheel is built from. */
const ITEM_H = 34
/**
 * Where the drum's centre sits: a little below the middle of the viewport.
 * Everything else on the page is placed against this — the tagline above, the
 * mark below, the panel under it — so the wheel and what surrounds it can
 * never drift apart. Move this one value and the whole page follows.
 */
const WHEEL_TOP = 'calc(45% - 20px)'
/** Seven rows deep — what the drum shows at once. */
const WHEEL_H = ITEM_H * 7
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
 * The wheel is the whole of mobile: Home, the work, Contact. Each row declares
 * what it puts behind itself and what it puts under itself, so the page has
 * one loop rather than a set of special cases.
 *
 * About used to be a row of its own. It said the same thing the landing said,
 * one notch further down, so it folded into Home: the studio's line and its
 * roster now sit under the first row you land on, and the row itself is gone.
 */
type Row =
  | { kind: 'home'; label: string; frame: string; href: string }
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

  // Continuous position of the drum, in rows. 0 is the first project centred.
  const pos = useRef(0)
  const raf = useRef(0)
  const visible = useRef(false)
  // Glide state: where a throw started, where it is going, and when.
  const glide = useRef<{
    from: number
    to: number
    t0: number
    dur: number
    ease: (t: number) => number
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
      glide.current = {
        from,
        to,
        ease,
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

      // Pulled past an end and let go: no coast, just spring back.
      if (pos.current < 0 || pos.current > COUNT - 1) {
        settle(pos.current, easeOut, 260)
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

        /* About trades the photo ground for the footer's IKB block. The studio
           talking about itself is a different kind of place than the work, and
           the one saturated colour on the site says so. Sits above the scrim so
           the blue lands flat rather than dimmed, and crossfades on the frames'
           own timing so the swap reads as one move. */
        .mps-ikb {
          position: absolute;
          inset: 0;
          background: ${IKB};
          opacity: 0;
          transition: opacity 620ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mps-ikb[data-on='true'] { opacity: 1; }

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
          width: min(20rem, 86vw);
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
          width: min(17.5rem, 74vw);
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
        /* The highlight box the selected row sits in. */
        .mps-band {
          position: absolute;
          left: -0.35rem;
          right: -0.35rem;
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
        .mps-panel[data-kind='home'] { justify-content: center; }
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
          .mps-bg img, .mps-row, .mps-ikb { transition: none; }
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
        <div className="mps-ikb" data-on={row.kind === 'home'} />
      </div>

      <div className="mps-wheelbg" aria-hidden />

      {/* The slot above the wheel, now the mark alone. The studio's line used
          to sit here on the About row, saying in three lines what the copy
          under the wheel says in one — so the line went and the copy moved to
          Home. Always mounted, so it fades rather than appears. */}
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
        {row.kind === 'home' && (
          <>
            {/* What the studio actually makes, said once, on the row you land
                on. This is the whole of the old About row: there is no second
                place to go for it. */}
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

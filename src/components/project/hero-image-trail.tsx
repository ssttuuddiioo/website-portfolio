'use client'

import { useRef, useEffect, useMemo, useCallback } from 'react'

const POOL_SIZE = 10
const SPAWN_DISTANCE = 35
const IMAGE_WIDTH = 364
const IMAGE_HEIGHT = 234
// Opacity a frame settles at. The page ground is near-black, so anything much
// below this reads muddy rather than lit.
const PEAK_OPACITY = 0.9
// How long a frame holds at full strength after a newer frame supersedes it.
// The newest frame never gets this treatment — it stays until something
// replaces it, so letting the pointer rest leaves one image on the field.
const FRAME_LINGER = 250
// Quiet after the last spawn before the field counts as at rest and the click
// prompt fades up under the resting frame. A full second, so it only ever
// appears for a pointer that has actually stopped.
const REST_DELAY = 1000
// Air between the bottom of the resting frame and its prompt.
const CTA_GAP = 14
// Quiet after the last spawn before the credit line counts as landed and
// settles into focus. Short — this is the pointer pausing, not resting; the
// click prompt still waits out the full REST_DELAY above.
const SETTLE_DELAY = 150

/**
 * A trail entry: a bare src, or a src carrying the line shown beside the field
 * while that image is the one resting on top.
 */
export interface TrailItem {
  src: string
  title?: string
  meta?: string
  /**
   * Click prompt shown under the title once the trail comes to rest. Supplying
   * one (together with `onSelect`) is what makes the field clickable.
   */
  cta?: string
  /**
   * Where this entry sits in the tag field, 0–1 in each axis (see
   * lib/project-tags). When every entry carries one, the trail stops cycling in
   * order and instead favours whatever is nearest the pointer — so steering
   * toward a pole surfaces that pole's work.
   */
  pos?: { x: number; y: number }
}

/** A labelled pole on the field, placed in the same 0–1 coordinates. */
export interface TrailNode {
  label: string
  x: number
  y: number
}

export type TrailImage = string | TrailItem

interface HeroImageTrailProps {
  images: TrailImage[]
  /** Dotted-grid ground. On by default; off when the trail runs over media. */
  grid?: boolean
  /**
   * Fired when the field is clicked while `item` is the resting frame. The
   * trail owns no routing — the page decides where each entry goes.
   */
  onSelect?: (item: TrailItem, index: number) => void
  /**
   * Where the resting frame's line sits. 'corner' hangs it off the nav dock in
   * the top-right; 'statement' drops it bottom-left onto the page's content
   * grid, taking the slot the studio statement otherwise occupies at the fold.
   */
  captionAnchor?: 'corner' | 'statement'
  /**
   * The poles to draw on the field. Supplying them (with positioned items) is
   * what turns the trail from a fixed cycle into something steerable.
   */
  nodes?: TrailNode[]
}

// The caption hangs off the nav dock, so it copies the dock's own right inset
// (see landing-sidebar) and clears its height from the top.
const CAPTION_RIGHT =
  'max(calc(1.25rem + env(safe-area-inset-right)), calc(var(--gutter, 1.5rem) + env(safe-area-inset-right) - 100px))'
const CAPTION_TOP =
  'clamp(1.4rem, 3.4vh, 2.4rem) + env(safe-area-inset-top) + 4rem'

// Clicks that land on anything already interactive (the nav dock, a link in
// the statement) belong to that element, not to the trail behind it.
const IGNORE_CLICK =
  'a, button, input, textarea, select, label, nav, [role="button"], [data-trail-ignore]'

export function HeroImageTrail({
  images,
  grid = true,
  onSelect,
  captionAnchor = 'corner',
  nodes,
}: HeroImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const poolRefs = useRef<(HTMLImageElement | null)[]>([])
  const currentIndex = useRef(0)
  const imageIndex = useRef(0)
  const lastSpawn = useRef({ x: -999, y: -999 })
  const lastPointer = useRef({ x: -999, y: -999 })
  const boundsRef = useRef<DOMRect | null>(null)
  const zCounter = useRef(1)
  const isCoarse = useRef(false)
  const prefersReducedMotion = useRef(false)
  const timeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  // The frame currently on top: which pool slot holds it, when it landed, and
  // which entry it credits. Nothing fades it out — the next spawn retires it.
  const topFrame = useRef<{ slot: number; at: number } | null>(null)
  const resting = useRef<{ item: TrailItem; index: number } | null>(null)
  // Caption — written to imperatively (like the pool) so a spawn every 35px of
  // pointer travel never costs a React render.
  const captionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLSpanElement>(null)
  const metaRef = useRef<HTMLSpanElement>(null)
  const ctaRef = useRef<HTMLSpanElement>(null)
  const restTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Whether a click on the field would open something right now. Drives the
  // cursor, so it has to drop as soon as the pointer leaves the field.
  const armed = useRef(false)
  // Pointer position within the tag field, 0–1. The field is the first screen,
  // not the whole container — the homepage runs the trail on past the fold, and
  // all four poles have to stay reachable without scrolling — so y is clamped
  // and anything below the fold reads as the field's bottom edge.
  const tagPoint = useRef({ x: 0.5, y: 0.5 })
  // The entry spawned last, so the picker never plays the same frame twice.
  const lastPicked = useRef(-1)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const nearestNode = useRef(-1)
  // Held in a ref so an inline handler from the page doesn't re-bind listeners.
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Normalize to objects once, so the spawn path can read title/meta directly.
  const items = useMemo<TrailItem[]>(
    () => images.map((i) => (typeof i === 'string' ? { src: i } : i)),
    [images],
  )
  const hasCaptions = items.some((i) => i.title || i.meta || i.cta)
  // Steering only makes sense when every entry knows where it sits.
  const steerable = items.length > 0 && items.every((i) => i.pos)

  const setArmed = useCallback((next: boolean) => {
    if (armed.current === next) return
    armed.current = next
    document.body.style.cursor = next ? 'pointer' : ''
  }, [])

  // Preload images + detect input/motion prefs
  useEffect(() => {
    items.forEach(({ src }) => {
      const img = new window.Image()
      img.src = src
    })

    isCoarse.current = window.matchMedia('(pointer: coarse)').matches
    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }, [items])

  // Cache bounds via ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateBounds = () => {
      boundsRef.current = container.getBoundingClientRect()
    }
    updateBounds()

    const ro = new ResizeObserver(updateBounds)
    ro.observe(container)

    // Scrolling moves the field out from under a stationary pointer, so the
    // cursor has to disarm even though no mousemove ever fires.
    const onScroll = () => {
      const b = container.getBoundingClientRect()
      boundsRef.current = b
      const { x, y } = lastPointer.current
      const inside =
        x >= b.left && x <= b.right && y >= b.top && y <= b.bottom
      if (!inside) setArmed(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [setArmed])

  /**
   * Which entry to play next.
   *
   * Without positions this is the original strict cycle. With them, each entry
   * is weighted by a gaussian on its distance from the pointer's point in the
   * tag field, then sampled — so near a pole that pole's work comes up most of
   * the time and the rest only occasionally, and in open ground the mix is
   * broad. Sampling rather than simply taking the nearest keeps the trail from
   * locking onto one frame while the pointer hovers in one place; excluding the
   * last pick keeps it from repeating back to back.
   */
  const pickIndex = useCallback(() => {
    if (!steerable) return imageIndex.current++ % items.length

    const { x, y } = tagPoint.current
    // How far the pull reaches, in field units. Tuned against the current
    // spread: at 0.2, standing on a pole plays its own work ~70-90% of the
    // time, while open ground still reaches all 18 entries. Widening it blurs
    // the poles together; much below this and the middle of the field stops
    // showing some projects at all.
    const SIGMA = 0.2
    const weights = items.map((it, i) => {
      if (!it.pos || i === lastPicked.current) return 0
      const dx = it.pos.x - x
      const dy = it.pos.y - y
      return Math.exp(-(dx * dx + dy * dy) / (SIGMA * SIGMA))
    })
    const total = weights.reduce((a, b) => a + b, 0)
    if (total <= 0) return imageIndex.current++ % items.length

    let r = Math.random() * total
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i]
      if (r <= 0) {
        lastPicked.current = i
        return i
      }
    }
    return weights.length - 1
  }, [items, steerable])

  /**
   * Light the pole the pointer is closest to, and only when it is close enough
   * to read as deliberate. Written straight to the DOM like the caption and the
   * pool — this runs on every mousemove and must never cost a render.
   */
  const highlightNearest = useCallback(() => {
    if (!nodes?.length) return
    const { x, y } = tagPoint.current
    let best = -1
    let bestDist = 0.26 // beyond this the pointer is in open ground
    nodes.forEach((n, i) => {
      const d = Math.hypot(n.x - x, n.y - y)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    if (best === nearestNode.current) return
    nearestNode.current = best
    nodeRefs.current.forEach((el, i) => {
      if (el) el.dataset.near = i === best ? 'true' : 'false'
    })
  }, [nodes])

  const spawnImage = useCallback(
    (x: number, y: number) => {
      const idx = currentIndex.current % POOL_SIZE
      const el = poolRefs.current[idx]
      if (!el) return

      // Clear any pending fade-out for this slot
      const existingTimeout = timeouts.current.get(idx)
      if (existingTimeout) clearTimeout(existingTimeout)

      // Retire the frame this one is about to bury. It was never given a fade
      // of its own, so it gets whatever is left of its linger now.
      const prev = topFrame.current
      if (prev && prev.slot !== idx) {
        const prevEl = poolRefs.current[prev.slot]
        if (prevEl) {
          const pending = timeouts.current.get(prev.slot)
          if (pending) clearTimeout(pending)
          const remaining = Math.max(
            0,
            FRAME_LINGER - (performance.now() - prev.at),
          )
          const fade = setTimeout(() => {
            prevEl.style.transition = 'opacity 800ms cubic-bezier(0.22, 1, 0.36, 1)'
            prevEl.style.opacity = '0'
            timeouts.current.delete(prev.slot)
          }, remaining)
          timeouts.current.set(prev.slot, fade)
        }
      }

      // Pick next image — nearest the pointer's pole when steerable, else the
      // plain cycle.
      const itemIdx = pickIndex()
      const item = items[itemIdx]

      // Slight random rotation for organic feel
      const rotation = (Math.random() - 0.5) * 6

      // Instant reset — no transition while positioning
      el.style.transition = 'none'
      el.style.opacity = '0'
      el.style.transform = `translate(${x - IMAGE_WIDTH / 2}px, ${y - IMAGE_HEIGHT / 2}px) rotate(${rotation}deg) scale(0.92)`
      el.style.zIndex = String(zCounter.current++)
      if (el.src !== item.src) el.src = item.src

      // Force reflow, then animate in
      void el.offsetHeight
      el.style.transition = 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), transform 300ms cubic-bezier(0.22, 1, 0.36, 1)'
      el.style.opacity = String(PEAK_OPACITY)
      el.style.transform = `translate(${x - IMAGE_WIDTH / 2}px, ${y - IMAGE_HEIGHT / 2}px) rotate(${rotation}deg) scale(1)`

      // This frame stays put until the next spawn buries it.
      topFrame.current = { slot: idx, at: performance.now() }
      resting.current = { item, index: itemIdx }

      // Credit the image now on top. The line holds as long as the frame does.
      //
      // A frame spawns every 35px of travel, so during a sweep this runs many
      // times a second — far too fast for a transition between titles to ever
      // finish. Instead the line has two states. While the pointer is moving it
      // stays deliberately provisional: dimmed, softened, sitting a few pixels
      // low, flicking past as fast as the frames do. The pointer pauses and it
      // settles — into focus, into place, at full strength. The arrival is the
      // moment worth animating, not the swap.
      const cap = captionRef.current
      if (cap) {
        if (titleRef.current) titleRef.current.textContent = item.title ?? ''
        if (metaRef.current) metaRef.current.textContent = item.meta ?? ''
        cap.style.opacity = '1'
        cap.dataset.state = 'moving'
        if (settleTimeout.current) clearTimeout(settleTimeout.current)
        settleTimeout.current = setTimeout(() => {
          cap.dataset.state = 'settled'
          settleTimeout.current = null
        }, SETTLE_DELAY)
      }

      // The prompt follows the frame, tucked under its bottom edge. It jumps to
      // the new spot while still invisible, then waits out REST_DELAY — so it
      // only ever surfaces once the pointer has genuinely stopped, never
      // strobing along behind a sweep.
      const cta = ctaRef.current
      if (cta) {
        cta.textContent = item.cta ?? ''
        cta.style.transition = 'none'
        cta.style.opacity = '0'
        cta.style.transform = `translate(${x - IMAGE_WIDTH / 2}px, ${y + IMAGE_HEIGHT / 2 + CTA_GAP}px)`
        void cta.offsetHeight
        cta.style.transition = 'opacity 450ms cubic-bezier(0.22, 1, 0.36, 1)'
        if (restTimeout.current) clearTimeout(restTimeout.current)
        restTimeout.current = setTimeout(() => {
          if (item.cta && onSelectRef.current) cta.style.opacity = '1'
          restTimeout.current = null
        }, REST_DELAY)
      }

      if (item.cta && onSelectRef.current) setArmed(true)

      currentIndex.current++
    },
    [items, setArmed, pickIndex]
  )

  // Pointer tracking on the window, not the container: the trail often sits
  // BEHIND page content (the homepage runs it under the hero type), and a
  // listener on the container would never see moves over those elements. The
  // cached bounds gate it to the trail's own box either way.
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isCoarse.current || prefersReducedMotion.current) return
      lastPointer.current = { x: e.clientX, y: e.clientY }
      const bounds = boundsRef.current
      if (!bounds) return

      const x = e.clientX - bounds.left
      const y = e.clientY - bounds.top
      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) {
        setArmed(false)
        return
      }

      if (resting.current?.item.cta && onSelectRef.current) setArmed(true)

      // The pointer's point in the tag field, read before any spawn so the
      // picker is always working from where the pointer actually is. The field
      // is the first screen: past the fold, y pins to its bottom edge.
      if (steerable || nodes?.length) {
        const screen = window.innerHeight || bounds.height
        tagPoint.current = {
          x: Math.min(1, Math.max(0, x / bounds.width)),
          y: Math.min(1, Math.max(0, y / screen)),
        }
        highlightNearest()
      }

      const dx = x - lastSpawn.current.x
      const dy = y - lastSpawn.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > SPAWN_DISTANCE) {
        lastSpawn.current = { x, y }
        spawnImage(x, y)
      }
    }

    // Same reasoning as the move listener: the field is behind the page, so the
    // click is caught on the way up and matched against the cached bounds.
    const onClick = (e: MouseEvent) => {
      if (isCoarse.current || prefersReducedMotion.current) return
      const handler = onSelectRef.current
      const rest = resting.current
      if (!handler || !rest?.item.cta) return

      const bounds = boundsRef.current
      if (!bounds) return
      const x = e.clientX - bounds.left
      const y = e.clientY - bounds.top
      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return

      const target = e.target as Element | null
      if (target?.closest?.(IGNORE_CLICK)) return
      // A click that ends a text selection is not a click on the field.
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) return

      handler(rest.item, rest.index)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click', onClick)
    }
  }, [spawnImage, setArmed, steerable, nodes, highlightNearest])

  // Cleanup timeouts on unmount
  useEffect(() => {
    const t = timeouts.current
    const rest = restTimeout
    const settle = settleTimeout
    return () => {
      t.forEach((timeout) => clearTimeout(timeout))
      if (rest.current) clearTimeout(rest.current)
      if (settle.current) clearTimeout(settle.current)
      document.body.style.cursor = ''
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        zIndex: 0,
        backgroundImage: grid
          ? 'radial-gradient(circle, rgba(85, 82, 80, 0.3) 1px, transparent 1px)'
          : undefined,
        backgroundSize: grid ? '32px 32px' : undefined,
      }}
    >
      {/* The poles. Drawn under every frame and inert to the pointer — they
          label the field, they are not controls. The drift is a few pixels over
          twenty-odd seconds, each on its own phase: enough that the field is
          never quite still, not enough to read as animation. */}
      {nodes && nodes.length > 0 && (
        <>
          <style>{`
            .trail-node {
              position: absolute;
              display: flex;
              align-items: center;
              gap: 0.55rem;
              white-space: nowrap;
              pointer-events: none;
              z-index: 1;
              /* Futura, set up in globals as --font-display. Geometric caps
                 want a little more size and tracking than the mono did, and a
                 touch of weight so the thin strokes hold at this scale. */
              font-size: 0.78rem;
              font-weight: 500;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              color: rgba(232, 228, 223, 0.68);
              transition: color 420ms cubic-bezier(0.22, 1, 0.36, 1);
              animation: trail-node-drift var(--dur) ease-in-out var(--delay) infinite;
            }
            .trail-node-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: currentColor;
              flex: none;
              transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            .trail-node[data-near='true'] { color: #e8e4df; }
            .trail-node[data-near='true'] .trail-node-dot { transform: scale(1.9); }

            /* Translate lives entirely in the keyframes: the -50% centring is
               folded in so the animation never fights the placement. */
            @keyframes trail-node-drift {
              0%, 100% { transform: translate(-50%, -50%); }
              25%  { transform: translate(-50%, -50%) translate(var(--dx), calc(var(--dy) * -1)); }
              50%  { transform: translate(-50%, -50%) translate(calc(var(--dx) * -0.7), var(--dy)); }
              75%  { transform: translate(-50%, -50%) translate(calc(var(--dx) * 0.5), calc(var(--dy) * 0.6)); }
            }
            @media (prefers-reduced-motion: reduce) {
              .trail-node { animation: none; transform: translate(-50%, -50%); }
            }
          `}</style>
          {nodes.map((n, i) => (
            <div
              key={n.label}
              ref={(el) => {
                nodeRefs.current[i] = el
              }}
              data-trail-ignore
              data-near="false"
              className="trail-node font-display"
              style={
                {
                  left: `${n.x * 100}%`,
                  // Positioned against the first screen, the same box the
                  // pointer is normalised against — not the container, which on
                  // the homepage runs well past the fold.
                  top: `calc(${n.y} * 100svh)`,
                  '--dx': `${3 + ((i * 7) % 3)}px`,
                  '--dy': `${4 + ((i * 5) % 3)}px`,
                  '--dur': `${19 + i * 3.5}s`,
                  '--delay': `-${i * 4.5}s`,
                } as React.CSSProperties
              }
            >
              <span className="trail-node-dot" />
              <span>{n.label}</span>
            </div>
          ))}
        </>
      )}

      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          ref={(el) => {
            poolRefs.current[i] = el
          }}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            objectFit: 'cover',
            opacity: 0,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            borderRadius: '2px',
          }}
        />
      ))}

      {/* The resting frame's line. Sits above every pooled image (they climb
          zCounter), arrives with the first frame and stays as long as that
          frame does. Two placements, per `captionAnchor`: hung off the nav
          dock in the top-right, or — where the field is the whole first
          screen — dropped onto the content grid at the fold, in the slot the
          studio statement otherwise occupies. */}
      {hasCaptions && (
        <div
          ref={captionRef}
          aria-hidden
          data-state="settled"
          className={`trail-caption trail-caption--${captionAnchor}`}
        >
          <style>{`
            .trail-caption {
              position: absolute;
              z-index: 9999;
              opacity: 0;
              transition: opacity 450ms cubic-bezier(0.22, 1, 0.36, 1);
              pointer-events: none;
              color: inherit;
              /* Corner placement — ranged right and hung just under the nav
                 dock; the insets mirror the dock's own (landing-sidebar). */
              right: ${CAPTION_RIGHT};
              top: calc(${CAPTION_TOP});
              max-width: min(34rem, 60vw);
              text-align: right;
            }
            /* Two states, driven off data-state in the spawn path: "moving" is
               the readout flicking past under a sweeping pointer, "settled" is
               the frame you actually landed on. Only transform, opacity and
               filter are animated — all compositor-side, so this stays cheap
               even while frames spawn several times a second. Nothing animates
               letter-spacing or size: those reflow, and at 4.4rem that is a
               layout pass per frame. */
            .trail-caption-title,
            .trail-caption-meta {
              will-change: transform, opacity, filter;
              transition:
                opacity 420ms cubic-bezier(0.16, 1, 0.3, 1),
                filter 420ms cubic-bezier(0.16, 1, 0.3, 1),
                transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
            }
            .trail-caption[data-state='moving'] .trail-caption-title {
              opacity: 0.42;
              filter: blur(3px);
              transform: translateY(7px) scale(0.985);
              /* Snap out of focus immediately; only the settle is eased. */
              transition-duration: 90ms;
            }
            .trail-caption[data-state='moving'] .trail-caption-meta {
              opacity: 0;
              transform: translateY(5px);
              transition-duration: 90ms;
            }
            .trail-caption[data-state='settled'] .trail-caption-title {
              opacity: 1;
              filter: blur(0);
              transform: none;
            }
            .trail-caption[data-state='settled'] .trail-caption-meta {
              opacity: 0.55;
              transform: none;
              /* Lands just after the title, so the pair reads as one arrival
                 rather than two things moving at once. */
              transition-delay: 90ms;
            }
            /* The title still swaps and the line still reads; it simply does
               not blur or travel to get there. */
            @media (prefers-reduced-motion: reduce) {
              .trail-caption-title,
              .trail-caption-meta {
                transition: opacity 200ms linear;
                filter: none !important;
                transform: none !important;
              }
              .trail-caption[data-state='moving'] .trail-caption-title { opacity: 0.7; }
            }

            /* Statement placement — bottom-left on the page's 1440 grid, with
               the same leftward pull the studio statement carries so the two
               land on one optical edge. Percentages resolve against this
               container (the full-width field), the same basis the statement's
               own centering and shift use, so the two edges agree.
               Desktop only: below 900px the statement keeps the fold and the
               caption stays in the corner — moot in practice, since the trail
               is silent on a coarse pointer. */
            @media (min-width: 900px) {
              .trail-caption--statement {
                left: 0;
                right: 0;
                bottom: auto;
                /* Held at the fold, not at the foot of the field. The field now
                   runs past the first screen (the homepage extends it down
                   through the studio statement), so measuring up from the
                   bottom would strand the line at the very end of that run.
                   Measuring down from the top pins it to the first screen
                   whatever the field's height: the block's own bottom edge
                   lands one inset above 100svh. */
                top: calc(100svh - clamp(2rem, 5.5vh, 3.8rem));
                transform: translateY(-100%);
                max-width: none;
                text-align: left;
                padding-right: var(--gutter, 1.5rem);
                padding-left: calc(
                  max(
                    var(--gutter, 1.5rem),
                    (100% - 1440px) / 2 + var(--gutter, 1.5rem)
                  ) -
                    min(
                      150px,
                      max(
                        0px,
                        (100% - 1440px) / 2 + var(--gutter, 1.5rem) - 40px
                      )
                    )
                );
              }
              /* Keep a long title off the right half of the grid, the way the
                 statement's own column does. */
              .trail-caption--statement .trail-caption-title,
              .trail-caption--statement .trail-caption-meta {
                max-width: min(60%, 46rem);
              }
            }
          `}</style>
          <span
            ref={titleRef}
            className="trail-caption-title font-display"
            style={{
              display: 'block',
              fontWeight: 700,
              fontSize: 'clamp(2.1rem, 5vw, 4.4rem)',
              letterSpacing: '-0.04em',
              lineHeight: 0.98,
            }}
          />
          <span
            ref={metaRef}
            className="trail-caption-meta font-mono"
            style={{
              display: 'block',
              fontSize: 'clamp(0.72rem, 0.95vw, 1.05rem)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              // Opacity is owned by the settle states above, not set here — an
              // inline value would win over them.
              marginTop: '1.2rem',
            }}
          />
        </div>
      )}

      {/* Click prompt for the resting frame. Positioned off the frame itself
          rather than the corner block, so it reads as a label on the picture
          that stayed. */}
      {hasCaptions && (
        <span
          ref={ctaRef}
          aria-hidden
          className="font-mono"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: IMAGE_WIDTH,
            textAlign: 'center',
            zIndex: 9999,
            fontSize: 'clamp(0.68rem, 0.8vw, 0.82rem)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            opacity: 0,
            pointerEvents: 'none',
            color: 'inherit',
            willChange: 'transform, opacity',
          }}
        />
      )}
    </div>
  )
}

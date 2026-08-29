'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useLenis } from '@/lib/lenis-provider'
import { centerOffset } from './use-scroll-to-section'
import { INK, BLUE, BG, SURFACE, ink } from './landing-theme'

type Item =
  /** `offHref` is where the item points from a page that isn't the landing;
      without one it falls back to the landing's own anchor, /#<id>. */
  | { id: string; label: string; kind: 'scroll'; offHref?: string }
  | { id: string; label: string; kind: 'route'; href: string }
  /** The first screen's view switch, not a place: it swaps the image trail for
      the index grid standing in its place. Off the landing there is no trail to
      swap, so it links to /#work, which opens the landing with the grid up. */
  | { id: string; label: string; kind: 'index' }

const ITEMS: Item[] = [
  // Home is the trail: on the landing it puts the first screen back (closing
  // the index if it is up); from any other page it routes to `/`, which opens
  // on the trail. Plain `/` rather than `/#home` — there is nothing to scroll
  // to, and a hash would only linger in the address bar.
  { id: 'home', label: 'home', kind: 'scroll', offHref: '/' },
  // The trail's counterpart, and deliberately next to it: the same work laid
  // out as a grid. The pair reads as the two ways of looking at the first
  // screen, which is why the marks sit together rather than the grid being
  // parked in a far corner.
  { id: 'index', label: 'index', kind: 'index' },
  // About is the footer band: the landing's statement now opens the page at the
  // fold, and the studio's detail — nav, capabilities, socials — is what the
  // band carries.
  { id: 'about', label: 'about', kind: 'scroll', offHref: '/#site-footer' },
  // Work is the index grid standing in for the image trail on the landing's
  // first screen, not a section. On the landing the page flips it on; from
  // anywhere else the hash tells the landing to open with it up.
  { id: 'work', label: 'work', kind: 'scroll' },
  // { id: 'services', label: 'services', kind: 'route', href: '/about#services' }, // hidden for now
  // { id: 'ideas', label: 'notes', kind: 'scroll' }, // hidden for now
  // Contact has a page of its own, so it navigates rather than scrolls — on
  // the landing and on every inner page alike.
  { id: 'contact', label: 'contact', kind: 'route', href: '/contact' },
]

// Order = 2x2 grid reading order: Instagram, LinkedIn on top; Email, GitHub below.
// The Email item routes to /contact in the same tab rather than opening a new one.
const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
  { label: 'Email', href: '/contact', icon: 'mail', contact: true },
  { label: 'GitHub', href: 'https://github.com', icon: 'github' },
]

/**
 * The cursor's ghost block in the nav dock. Blue at partial strength over the
 * dock's near-black surface: plainly lighter than the ground, plainly dimmer
 * than the filled active block, so the order reads active > hover > rest. The
 * brighter hairline draws the cell's edge, which is the part that actually
 * says "this is a button" before you click it.
 */
const BLUE_GHOST = 'rgba(31, 68, 255, 0.40)'
const BLUE_GHOST_EDGE = 'rgba(107, 131, 255, 0.55)'

/** A measured dock cell: its left offset and width inside the row. */
type Box = { x: number; width: number }

/**
 * Three frames cascading down and to the right: the image trail itself, drawn
 * small. It stands where the "home" word used to, because home *is* the trail
 * — the first screen of the landing — and a house said nothing about what you
 * were going back to. Square corners and the social icons' stroke weight, so
 * it sits in the same family as everything else in the dock, and it reads as
 * the counterpart to the index's 3x3 grid mark (see project-index).
 *
 * The two frames behind the front one are drawn as open paths tracing only the
 * edges that aren't covered, so the stack occludes properly without needing a
 * fill — which matters here, since the cell behind it turns blue when active.
 */
function TrailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ display: 'block' }}
    >
      {/* Furthest back, then the middle one — each stopping where the frame in
          front of it takes over. */}
      <path d="M6.5 12H3V4h11v3.5" />
      <path d="M10 15.5H6.5v-8h11V11" />
      <rect x="10" y="11" width="11" height="8" />
    </svg>
  )
}

/**
 * 3x3 of small squares — the index's mark, a miniature of the ruled sheet it
 * opens, and the counterpart to the trail mark beside it. Each cell carries the
 * step it takes away from the middle one, so the grid opens out under the
 * pointer (see .dock-grid-sq in the dock's style block).
 */
function GridIcon({ size = 17 }: { size?: number }) {
  const cells = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [r, c] as const))
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      style={{ display: 'block' }}
    >
      {cells.map(([r, c]) => (
        <rect
          key={`${r}${c}`}
          className="dock-grid-sq"
          x={c * 6}
          y={r * 6}
          width={4}
          height={4}
          // Lengths on an SVG child are user units, so this is 1.1 of the
          // 16-unit box however large the glyph is drawn.
          style={
            {
              '--dx': `${(c - 1) * 1.1}px`,
              '--dy': `${(r - 1) * 1.1}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  )
}

/** What the grid mark becomes while the index is up: press again to go back. */
function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      // Butt caps, to match the grid mark's square corners.
      aria-hidden
      style={{ display: 'block' }}
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  )
}

function SocialIcon({ name, size = 18 }: { name: string; size?: number }) {
  const c = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'instagram':
      return (
        <svg {...c}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...c}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 7l10 6 10-6" />
        </svg>
      )
    case 'github':
      return (
        <svg {...c}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...c}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    default:
      return null
  }
}

export function SocialRow({
  size,
  gap,
  horizontal = false,
  color = INK,
  restOpacity = 0.5,
}: {
  size: number
  gap: string
  horizontal?: boolean
  /** Icon color. Defaults to page ink; the IKB footer passes PAPER. */
  color?: string
  /** Resting opacity, raised to 1 on hover. */
  restOpacity?: number
}) {
  return (
    <div
      style={{
        display: horizontal ? 'flex' : 'grid',
        gridTemplateColumns: horizontal ? undefined : 'repeat(2, max-content)',
        alignItems: 'center',
        gap,
        width: 'max-content',
      }}
    >
      {SOCIALS.map((s) => {
        const isContact = 'contact' in s && s.contact
        return (
          <a
            key={s.label}
            href={s.href}
            target={isContact ? undefined : '_blank'}
            rel={isContact ? undefined : 'noreferrer'}
            aria-label={s.label}
            style={{
              color,
              opacity: restOpacity,
              display: 'flex',
              transition: 'opacity 200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = String(restOpacity))
            }
          >
            <SocialIcon name={s.icon} size={size} />
          </a>
        )
      })}
    </div>
  )
}

/**
 * Persistent left-hand nav on desktop; a hamburger (top-left) opening a
 * full-screen menu on mobile. A blue dot marks the active section. Scroll
 * items smooth-scroll via Lenis; route items navigate.
 */
export function LandingSidebar({
  active,
  inPage = true,
  dockOpacity,
  dockY,
  onNavigate,
  indexOpen = false,
  onToggleIndex,
  pinned = true,
}: {
  active: string
  inPage?: boolean
  // Reveal animation for the desktop dock, driven by the hero scroll. When
  // omitted (e.g. on inner pages) the dock is simply always visible.
  dockOpacity?: MotionValue<number>
  dockY?: MotionValue<number>
  // Section navigation owned by the landing page: sets the highlight and locks
  // the scroll-spy for the duration of the programmatic scroll. When omitted
  // we fall back to a plain Lenis scroll.
  onNavigate?: (id: string) => void
  /** True while the index grid stands in for the trail on the first screen. */
  indexOpen?: boolean
  // The first screen's view switch, owned by the landing page. Without it (any
  // inner page) the grid mark is a link home to the index instead of a toggle.
  onToggleIndex?: () => void
  /**
   * Whether the dock holds the viewport's corner as the page scrolls. Off, it
   * takes the document's corner instead and scrolls away with everything else:
   * the landing, where it belongs to the first screen, and the project page,
   * where it is one cell of the sheet's head row. Neither has any business
   * outliving the row it sits in.
   */
  pinned?: boolean
}) {
  const lenis = useLenis()
  const [open, setOpen] = useState(false)

  // Fallback so the hooks run unconditionally even when no reveal is passed
  // (inner pages): the dock just sits fully visible at rest.
  const restOpacity = useMotionValue(1)
  const restY = useMotionValue(0)
  const navOpacity = dockOpacity ?? restOpacity
  const navY = dockY ?? restY
  // Don't let the dock capture clicks while it's still tucked away/fading in.
  const dockPointer = useTransform(navOpacity, (o) =>
    o > 0.05 ? 'auto' : 'none',
  )

  // Escape puts the trail back. Came with the button from the corner toggle:
  // the index stands in for a whole screen, so there has to be a way out of it
  // that isn't hunting for the mark again.
  useEffect(() => {
    if (!indexOpen || !onToggleIndex) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggleIndex()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [indexOpen, onToggleIndex])

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    if (!lenis) return
    if (open) lenis.stop()
    else lenis.start()
    return () => lenis.start()
  }, [open, lenis])

  // Prefer the page-owned navigation (highlight + spy lock); otherwise fall
  // back to a plain Lenis scroll. force: true so it runs even while the open
  // mobile menu has called lenis.stop().
  const go = (id: string) => {
    if (onNavigate) return onNavigate(id)
    const el = document.getElementById(id)
    if (!el) return
    const offset = centerOffset(el)
    if (lenis) lenis.scrollTo(el, { offset, force: true })
    else el.scrollIntoView({ behavior: 'smooth', block: offset < 0 ? 'center' : 'start' })
  }

  // Sliding highlight pill (desktop dock): we measure the active item's box and
  // animate a blue pill to it, so it snaps between items as the active section
  // changes — including continuously while a click-scroll is in flight.
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({})
  const navRef = useRef<HTMLElement | null>(null)
  const [boxes, setBoxes] = useState<Record<string, Box>>({})
  // The cell the cursor is over, plus the box it last sat on. One piece of
  // state, so leaving can drop the id while the ghost keeps its position and
  // fades out where it is rather than snapping back to the row's left edge.
  // Set on keyboard focus too, so tabbing lights the same block a mouse would.
  const [hover, setHover] = useState<{ id: string | null; box: Box | null }>({
    id: null,
    box: null,
  })

  useLayoutEffect(() => {
    const measure = () => {
      // Publish the dock's measured width so ruled pages can reserve exactly
      // the room it occupies — the project page's title strip runs up to it
      // rather than guessing at a padding.
      if (navRef.current) {
        document.documentElement.style.setProperty(
          '--dock-w',
          `${navRef.current.offsetWidth}px`,
        )
      }
      const next: Record<string, Box> = {}
      for (const item of ITEMS) {
        const el = itemRefs.current[item.id]
        if (el) next[item.id] = { x: el.offsetLeft, width: el.offsetWidth }
      }
      setBoxes(next)
    }
    measure()
    window.addEventListener('resize', measure)
    // Re-measure once the mono font has loaded so the metrics are final.
    document.fonts?.ready?.then(measure).catch(() => {})
    return () => window.removeEventListener('resize', measure)
  }, [active])

  const pill = boxes[active] ?? null

  // Live box while the cursor is on a cell; the remembered one on the way out.
  const ghost = (hover.id ? boxes[hover.id] : null) ?? hover.box
  // Never under the active item — that cell is already filled solid, and a
  // ghost beneath it would only muddy the blue.
  const showGhost = ghost !== null && hover.id !== null && hover.id !== active

  // Horizontal dock item: a mono label filling its cell. The active item reads
  // white over the sliding blue pill; the hovered one reads white over the
  // ghost block (both rendered behind the row); the rest sit at dimmed ink.
  const renderDockItem = (item: Item) => {
    const isActive = active === item.id
    const isHovered = hover.id === item.id
    const isHome = item.id === 'home'
    const isIndex = item.kind === 'index'
    // The two marks size to their glyph; the words split what's left. Equal
    // cells would starve "contact" at the dock's narrowest.
    const isMark = isHome || isIndex
    // The index mark has no pill of its own — it isn't a section — so while the
    // grid is up it carries the lit state itself.
    const isLit = isActive || isHovered || (isIndex && indexOpen)
    const labelStyle: React.CSSProperties = {
      fontFamily: 'var(--font-mono), monospace',
      // The words step back so the two marks can hold the head of the dock:
      // they name places you can already see, the marks switch what you're
      // looking at.
      fontSize: '0.8rem',
      letterSpacing: '0.01em',
      // Lit for both states: white over the solid pill, white over the ghost.
      color: isLit ? '#fff' : INK,
      opacity: isLit ? 1 : 0.4,
      fontWeight: isActive ? 700 : 400,
      transition: 'color 200ms, opacity 200ms',
      background: 'none',
      border: 'none',
      // The label carries the cell's padding and fills it, so the block that
      // lights up under the cursor is exactly the thing you can click — not
      // just the word inside it.
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      // Twice the room around the marks: they read as the pair that runs the
      // first screen, and the space is what separates them from the words. The
      // words tighten to pay for it, so nothing overflows at the dock's
      // narrowest.
      padding: isMark ? '0 1.8rem' : '0 0.5rem',
      boxSizing: 'border-box',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }
    const enter = () => setHover({ id: item.id, box: boxes[item.id] ?? null })
    // Pointer, filtered to mouse: a tap shouldn't strand the ghost under a
    // finger, since touch never fires the matching leave. Focus mirrors it so
    // the keyboard gets the same read.
    const track = {
      onPointerEnter: (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse') enter()
      },
      onFocus: enter,
      onBlur: () =>
        setHover((h) => (h.id === item.id ? { id: null, box: h.box } : h)),
    }

    // The pair at the head of the dock reads as marks, not words: the trail's
    // stack of frames, and the index's 3x3. Everything after them is a word.
    let content: React.ReactNode = item.label
    let a11yLabel: string | undefined
    if (isHome) {
      content = <TrailIcon size={18} />
      a11yLabel = 'home'
    } else if (isIndex) {
      content = indexOpen ? <CloseIcon /> : <GridIcon />
      a11yLabel = indexOpen
        ? 'Back to the image trail'
        : 'Show the project index'
    }

    let label: React.ReactNode
    if (item.kind === 'index') {
      // On the landing the mark switches the first screen in place. Anywhere
      // else there is no screen to switch, so it goes home with the grid up.
      label = onToggleIndex ? (
        <button
          type="button"
          className="dock-mark"
          style={labelStyle}
          aria-label={a11yLabel}
          aria-expanded={indexOpen}
          aria-controls="project-index"
          onClick={onToggleIndex}
          {...track}
        >
          {content}
        </button>
      ) : (
        <Link
          href="/#work"
          className="dock-mark"
          style={labelStyle}
          aria-label={a11yLabel}
          {...track}
        >
          {content}
        </Link>
      )
    } else if (item.kind === 'route') {
      label = (
        <Link href={item.href} style={labelStyle} aria-label={a11yLabel} {...track}>
          {content}
        </Link>
      )
    } else if (inPage) {
      label = (
        <button
          type="button"
          style={labelStyle}
          aria-label={a11yLabel}
          onClick={() => go(item.id)}
          {...track}
        >
          {content}
        </button>
      )
    } else {
      label = (
        <Link
          href={item.offHref ?? `/#${item.id}`}
          style={labelStyle}
          aria-label={a11yLabel}
          {...track}
        >
          {content}
        </Link>
      )
    }

    return (
      <li
        key={item.id}
        ref={(el) => {
          itemRefs.current[item.id] = el
        }}
        className="flex items-center justify-center"
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          // Words split the dock's fixed width between them; the marks take
          // only what their glyph and padding need.
          flex: isMark ? '0 0 auto' : '1 1 0',
          minWidth: 0,
          padding: 0,
          borderRadius: 0,
        }}
      >
        {label}
      </li>
    )
  }

  // The menu lists places, so it never sees the view switch (filtered at the
  // call site) — hence the narrowed type.
  const renderRow = (
    item: Exclude<Item, { kind: 'index' }>,
    dotSize: number,
    fontSize: string,
  ) => {
    const isActive = active === item.id
    const labelStyle: React.CSSProperties = {
      fontFamily: 'var(--font-mono), monospace',
      fontSize,
      letterSpacing: '0.01em',
      color: INK,
      opacity: isActive ? 1 : 0.5,
      transition: 'opacity 200ms',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      textAlign: 'left',
    }
    const onEnter = (e: React.MouseEvent<HTMLElement>) =>
      (e.currentTarget.style.opacity = '1')
    const onLeave = (e: React.MouseEvent<HTMLElement>) =>
      (e.currentTarget.style.opacity = isActive ? '1' : '0.5')

    let label: React.ReactNode
    if (item.kind === 'route') {
      label = (
        <Link
          href={item.href}
          style={labelStyle}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={() => setOpen(false)}
        >
          {item.label}
        </Link>
      )
    } else if (inPage) {
      label = (
        <button
          type="button"
          style={labelStyle}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={() => {
            go(item.id)
            setOpen(false)
          }}
        >
          {item.label}
        </button>
      )
    } else {
      label = (
        <Link
          href={item.offHref ?? `/#${item.id}`}
          style={labelStyle}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={() => setOpen(false)}
        >
          {item.label}
        </Link>
      )
    }

    return (
      <li
        key={item.id}
        className="flex items-center"
        style={{ height: dotSize + 11 }}
      >
        <span
          aria-hidden
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: isActive ? BLUE : 'transparent',
            marginRight: 10,
            flexShrink: 0,
            transition: 'background 200ms',
          }}
        />
        {label}
      </li>
    )
  }

  return (
    <>
      {/* Floating nav dock — pinned top-right on desktop, opposite the STUDIO
          lockup in the top-left; centered along the top on mobile. A single
          pill of nav links with the sliding blue highlight. Replaces the
          hamburger on mobile (see the .nav-dock overrides in the <style>). */}
      <motion.nav
        ref={navRef}
        className="flex nav-dock"
        style={{
          // Fixed to the viewport's corner, or absolute in the document's —
          // same corner on arrival either way, since the offsets below are
          // measured from the same origin at the top of the page. Absolute is
          // how the project page keeps the dock inside its head row: the row
          // scrolls, and the dock goes with it.
          position: pinned ? 'fixed' : 'absolute',
          // Locked to the ruled sheet's interior corner: --sheet-inset clears
          // the viewport, --rule-w clears the sheet's own frame. With the
          // height set to --dock-h (the head row's height) the dock's top,
          // right and bottom edges land exactly on that row's rules, so on a
          // project page it reads as a cell of the grid, not a floating pill.
          right: 'calc(var(--sheet-inset) + var(--rule-w) + env(safe-area-inset-right))',
          top: 'calc(var(--sheet-inset) + var(--rule-w) + env(safe-area-inset-top))',
          height: 'var(--dock-h)',
          // As wide as the rail below it, plus the rule itself, so the dock's
          // left border lands in the same 1px column as the hairline dividing
          // media from rail — one vertical rule from the sheet's top edge to
          // the bottom of the body.
          width: 'calc(var(--rail-w-vp) + 1px)',
          zIndex: 90,
          background: SURFACE,
          // Square. The grid has no round corners anywhere else.
          borderRadius: 0,
          // No padding: the items run edge to edge so the active block fills
          // the cell top to bottom.
          padding: 0,
          // Only the left edge is drawn — the other three sit against the
          // sheet's own hairlines, and a border there would double them.
          borderLeft: `1px solid ${ink(0.12)}`,
          // The shadow is for a dock standing over the work: trail frames run
          // under it on the landing, and it has to stay legible over a blown-
          // out one. On an inner page the ground behind it is flat — the sheet's
          // head row, a plain page — and a cell of a ruled grid doesn't cast
          // onto the row below it.
          boxShadow: inPage ? '0 12px 40px rgba(0,0,0,0.55)' : 'none',
          opacity: navOpacity,
          y: navY,
          pointerEvents: dockPointer,
        }}
      >
        <ul
          className="flex flex-row items-stretch"
          onPointerLeave={() => setHover((h) => ({ id: null, box: h.box }))}
          style={{
            position: 'relative',
            gap: 0,
            height: '100%',
            // Fills the dock so the items below can split it into equal cells;
            // left at its content width the row packs to the left and leaves
            // the dock's right end empty.
            width: '100%',
          }}
        >
          {/* Ghost block — a half-lit version of the pill that follows the
              cursor across the row, so a cell announces itself as clickable
              before it's clicked. Behind the solid pill, and hidden under the
              active cell, which is already filled. */}
          {ghost && (
            <motion.div
              aria-hidden
              initial={false}
              animate={{
                x: ghost.x,
                width: ghost.width,
                opacity: showGhost ? 1 : 0,
              }}
              transition={{
                x: { type: 'spring', stiffness: 420, damping: 38 },
                width: { type: 'spring', stiffness: 420, damping: 38 },
                opacity: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
              }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                background: BLUE_GHOST,
                // Hairline edge — the part that reads as a button face.
                boxShadow: `inset 0 0 0 1px ${BLUE_GHOST_EDGE}`,
                borderRadius: 0,
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          )}
          {/* Sliding blue highlight — snaps to the active item; springs along
              continuously while a click-scroll updates the active section. */}
          {pill && (
            <motion.div
              aria-hidden
              initial={false}
              animate={{ x: pill.x, width: pill.width }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                background: BLUE,
                // A square block that fills the cell, edge to edge.
                borderRadius: 0,
                zIndex: 0,
              }}
            />
          )}
          {ITEMS.map((item) => renderDockItem(item))}
        </ul>
      </motion.nav>

      {/* Hamburger — retired now that the bottom dock serves mobile too. Kept in
          the tree but force-hidden via .ss-hide; restore by removing that class. */}
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="ss-hide md:hidden fixed top-0 left-0 z-[90] flex flex-col justify-center"
        style={{
          paddingTop: 'calc(var(--gutter, 1.5rem) + env(safe-area-inset-top))',
          paddingLeft: 'calc(var(--gutter, 1.5rem) + env(safe-area-inset-left))',
          paddingRight: 'var(--gutter, 1.5rem)',
          paddingBottom: 'var(--gutter, 1.5rem)',
          gap: 6,
        }}
      >
        <span
          style={{
            display: 'block',
            width: 26,
            height: 2,
            background: INK,
            borderRadius: 2,
            transformOrigin: 'center',
            transform: open ? 'translateY(4px) rotate(45deg)' : 'none',
            transition: 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        <span
          style={{
            display: 'block',
            width: 26,
            height: 2,
            background: INK,
            borderRadius: 2,
            transformOrigin: 'center',
            transform: open ? 'translateY(-4px) rotate(-45deg)' : 'none',
            transition: 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </button>

      {/* Full-screen menu — also retired with the hamburger (force-hidden). */}
      <div
        className="ss-hide md:hidden fixed inset-0 z-[85]"
        style={{
          background: BG,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'calc(var(--gutter, 1.5rem) + 1rem)',
        }}
      >
        <ul className="flex flex-col" style={{ gap: '0.5rem' }}>
          {ITEMS.filter((i) => i.kind !== 'index').map((item) =>
            renderRow(item, 9, '1.6rem'),
          )}
        </ul>
        <div style={{ marginTop: '2.5rem', marginLeft: 19 }}>
          <SocialRow size={22} gap="1.25rem" />
        </div>
      </div>

      {/* Force-hide the retired hamburger + full-screen menu at every width, and
          shrink the dock so all the nav links fit on a phone. The corner it
          sits in never changes — see the narrow block below. */}
      <style>{`
        .ss-hide { display: none !important; }
        /* The grid mark opens out under the pointer — the nine cells step away
           from the middle one, so the glyph previews the sheet it shows. */
        .dock-grid-sq {
          transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (hover: hover) {
          .dock-mark:hover .dock-grid-sq {
            transform: translate(var(--dx), var(--dy));
          }
          /* Closing runs the other way: the cross turns back to square. */
          .dock-mark[aria-expanded='true']:hover { transform: rotate(90deg); }
        }
        .dock-mark {
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .dock-mark, .dock-grid-sq { transition: none; }
          .dock-mark[aria-expanded='true']:hover { transform: none; }
        }
        @media (max-width: 767px) {
          /* Narrow: the dock keeps the same top-right corner it holds at every
             other width — one fixed place on the page, so it is never hunted
             for — and only gives up the sheet's proportions: its own compact
             height (at the head row's full height it would blanket the project
             title underneath) and a width that shrinks to its contents. Square
             either way; the left-only border becomes a full outline since
             there is no sheet rule to meet. */
          .nav-dock {
            width: max-content !important;
            /* Whatever is left of the viewport once the corner it is pinned to
               is paid for on both sides. */
            max-width: calc(
              100vw - 2 * (var(--sheet-inset) + var(--rule-w))
            ) !important;
            height: auto !important;
            border: 1px solid ${ink(0.12)} !important;
          }
          .nav-dock ul { gap: 0 !important; }
          .nav-dock li {
            height: auto !important;
            flex: 0 0 auto !important;
            padding: 0 !important;
          }
          .nav-dock a, .nav-dock button {
            font-size: 0.72rem !important;
            padding: 0.6rem 0.45rem !important;
          }
        }
      `}</style>
    </>
  )
}
